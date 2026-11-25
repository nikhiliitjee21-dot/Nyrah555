import { useState, useEffect, useRef, useCallback } from "react";
import { AppConfig, AppState, GroundingSource } from "../types";
import { WebActionItem } from "../types/productivity";
import { LiveSessionManager } from "../services/liveService";
import { getZoyaResponse, getZoyaAudio, resetZoyaSession } from "../services/geminiService";
import { processCommand } from "../services/commandService";
import { playPCM } from "../utils/audioUtils";
import { detectVisionIntent, VisionIntent } from "../services/vision/VisionTriggerService";

export interface ChatMessage {
  id: string;
  sender: "user" | "zoya";
  text: string;
  sources?: GroundingSource[];
}

export function useVoiceCompanion(
  config: AppConfig | null,
  isMuted: boolean,
  volume: number,
  onPermissionDenied: () => void,
  onVisionIntent?: (intent: VisionIntent) => void
) {
  const [appState, setAppState] = useState<AppState>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem("zoya_chat_history");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse chat history:", e);
    }
    return [];
  });

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
    try {
      localStorage.setItem("zoya_chat_history", JSON.stringify(messages));
    } catch (e) {
      console.warn("Failed to save chat history:", e);
    }
  }, [messages]);

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isMicHearing, setIsMicHearing] = useState(false);
  const [liveNotice, setLiveNotice] = useState<string | null>(null);
  const [activeWebAction, setActiveWebAction] = useState<WebActionItem | null>(null);

  const liveSessionRef = useRef<LiveSessionManager | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (liveSessionRef.current) {
      liveSessionRef.current.isMuted = isMuted;
      liveSessionRef.current.volume = volume;
    }
  }, [isMuted, volume]);

  useEffect(() => {
    return () => {
      if (liveSessionRef.current) liveSessionRef.current.stop();
      if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch {} }
    };
  }, []);

  const handleTextCommand = useCallback(async (finalTranscript: string) => {
    if (!finalTranscript.trim() || !config) {
      setAppState("idle");
      return;
    }
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "user", text: finalTranscript }]);

    const visionIntent = detectVisionIntent(finalTranscript);
    if (visionIntent && onVisionIntent) {
      onVisionIntent(visionIntent);
    }

    if (isSessionActive && liveSessionRef.current) {
      liveSessionRef.current.sendText(finalTranscript);
      return;
    }
    setAppState("processing");
    const commandResult = processCommand(finalTranscript);
    let responseText = "";

    if (commandResult.isBrowserAction) {
      responseText = commandResult.action;
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);

      if (!isMuted) {
        setAppState("speaking");
        const audioBase64 = await getZoyaAudio(responseText, config);
        if (audioBase64) {
          await playPCM(audioBase64, isMuted ? 0 : volume);
        }
      }
      setAppState("idle");
      if (commandResult.url) {
        setActiveWebAction({
          id: "web-" + Date.now(),
          type: commandResult.url.includes("youtube.com") ? "youtube" : "website",
          title: commandResult.url.includes("youtube.com") ? "YouTube Video" : "Website",
          url: commandResult.url,
          createdAt: Date.now(),
        });
      }
    } else {
      const zoyaResult = await getZoyaResponse(finalTranscript, messagesRef.current, config);
      responseText = zoyaResult.text;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-z",
          sender: "zoya",
          text: responseText,
          sources: zoyaResult.sources,
        },
      ]);

      if (!isMuted) {
        setAppState("speaking");
        const audioBase64 = await getZoyaAudio(responseText, config);
        if (audioBase64) {
          await playPCM(audioBase64, isMuted ? 0 : volume);
        }
      }
      setAppState("idle");
    }
  }, [isMuted, volume, isSessionActive, config]);

  const startSpeechRecognitionMode = useCallback(() => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      return false;
    }
    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "hi-IN";

      recognition.onstart = () => {
        setIsSessionActive(true);
        setAppState("listening");
        setIsMicHearing(true);
      };

      recognition.onresult = (event: any) => {
        setIsMicHearing(false);
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          handleTextCommand(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
        setIsMicHearing(false);
        if (event.error === "not-allowed") {
          onPermissionDenied();
        }
        setIsSessionActive(false);
        setAppState("idle");
      };

      recognition.onend = () => {
        setIsMicHearing(false);
        if (appState === "listening") {
          setIsSessionActive(false);
          setAppState("idle");
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      return true;
    } catch (err) {
      console.warn("Speech recognition start failed:", err);
      return false;
    }
  }, [appState, handleTextCommand, onPermissionDenied]);

  const toggleListening = async (preAcquiredAudioStream?: MediaStream) => {
    if (isSessionActive) {
      setIsSessionActive(false);
      setIsMicHearing(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
      if (liveSessionRef.current) {
        liveSessionRef.current.stop();
        liveSessionRef.current = null;
      }
      setAppState("idle");
      resetZoyaSession();
    } else {
      if (!config) return;
      try {
        setIsSessionActive(true);
        resetZoyaSession();

        const session = new LiveSessionManager(config);
        if (preAcquiredAudioStream) session.setAudioStream(preAcquiredAudioStream);
        session.isMuted = isMuted;
        session.volume = volume;
        liveSessionRef.current = session;

        session.onStateChange = (state) => {
          setAppState(state);
          if (state === "idle") {
            setIsSessionActive(false);
          } else {
            setIsSessionActive(true);
          }
        };

        session.onMessage = (sender, text) => {
          setMessages((prev) => [...prev, { id: Date.now().toString() + "-" + sender, sender, text }]);
        };

        session.onCommand = (url, title, type) => {
          setActiveWebAction({
            id: "web-" + Date.now(),
            type: type || (url.includes("youtube.com") ? "youtube" : "website"),
            title: title || (url.includes("youtube.com") ? "YouTube Video" : "Website"),
            url,
            createdAt: Date.now(),
          });
        };

        session.onVisionIntent = onVisionIntent;

        session.onAudioLevel = (level) => {
          if (level > 0.012) {
            setIsMicHearing(true);
          } else if (level < 0.005) {
            setIsMicHearing(false);
          }
        };

        session.onError = (errMsg) => {
          console.warn("Live stream notice:", errMsg);
          setLiveNotice("Live voice streaming unavailable. Switched to Voice Mode (tap mic to talk).");
          setTimeout(() => setLiveNotice(null), 5000);
          setIsSessionActive(false);
          setAppState("idle");
        };

        await session.start();
      } catch (e: any) {
        console.error("Failed to start session", e);
        if (e?.name === "NotAllowedError" || e?.name === "PermissionDeniedError") {
          onPermissionDenied();
          setIsSessionActive(false);
          setAppState("idle");
        } else {
          setLiveNotice("Connecting via Voice Mode...");
          setTimeout(() => setLiveNotice(null), 4000);
          const started = startSpeechRecognitionMode();
          if (!started) {
            setIsSessionActive(false);
            setAppState("idle");
          }
        }
      }
    }
  };

  useEffect(() => {
    if (liveSessionRef.current) liveSessionRef.current.onVisionIntent = onVisionIntent;
  }, [onVisionIntent]);

  const clearMessages = () => {
    setMessages([]);
    resetZoyaSession();
    localStorage.removeItem("zoya_chat_history");
  };

  return {
    appState,
    messages,
    isSessionActive,
    isMicHearing,
    liveNotice,
    setLiveNotice,
    liveSessionRef,
    toggleListening,
    handleTextCommand,
    clearMessages,
    activeWebAction,
    clearWebAction: () => setActiveWebAction(null),
  };
}
