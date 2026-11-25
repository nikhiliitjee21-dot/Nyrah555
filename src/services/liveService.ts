import { AppConfig, AppState } from "../types";
import { AudioCaptureService } from "./audio/AudioCaptureService";
import { AudioPlaybackQueue } from "./audio/AudioPlaybackQueue";
import { WakeLockService } from "./device/WakeLockService";
import { getSanitizedVoice } from "./live/livePromptBuilder";
import { buildLiveInitMessage } from "./live/liveConfigBuilder";
import { handleLiveServerMessage } from "./live/liveMessageHandler";
import { executeProductivityTool } from "./tools/productivityExecutor";
import { loadProductivityState } from "./tools/productivityStorage";

export class LiveSessionManager {
  private ws: WebSocket | null = null;
  private isConnecting: boolean = false;
  private isExplicitlyStopped: boolean = false;
  private reconnectTimer: any = null;
  private processingSafetyTimer: any = null;
  private lastUserTranscript: string = "";

  private captureService = new AudioCaptureService();
  private playbackQueue = new AudioPlaybackQueue();
  private wakeLockService = new WakeLockService();

  public isMuted: boolean = false;
  public volume: number = 1.0;

  public onStateChange: (state: AppState) => void = () => {};
  public onMessage: (sender: "user" | "zoya", text: string) => void = () => {};
  public onCommand: (url: string, title?: string, type?: "youtube" | "website" | "search" | "whatsapp") => void = () => {};
  public onAudioLevel: (level: number) => void = () => {};
  public onError?: (errorMsg: string) => void;
  public onVisionIntent?: (intent: "open_camera" | "close_camera" | "open_screen" | null) => void;

  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 3;
  private boundVisibilityHandler: () => void;

  constructor(private config: AppConfig) {
    this.playbackQueue.onPlaybackStateChange = (isPlaying) => {
      if (isPlaying) {
        if (this.processingSafetyTimer) {
          clearTimeout(this.processingSafetyTimer);
          this.processingSafetyTimer = null;
        }
        this.onStateChange("speaking");
      } else {
        this.onStateChange("listening");
      }
    };

    this.boundVisibilityHandler = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        this.captureService.resumeIfNeeded();
        this.playbackQueue.resumeIfNeeded();
      }
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.boundVisibilityHandler);
    }
  }

  private setAppProcessing() {
    this.onStateChange("processing");
    if (this.processingSafetyTimer) clearTimeout(this.processingSafetyTimer);
    this.processingSafetyTimer = setTimeout(() => {
      if (!this.playbackQueue.getIsPlaying()) this.onStateChange("listening");
    }, 4500);
  }

  async start() {
    this.isExplicitlyStopped = false;
    this.onStateChange("processing");

    try {
      this.playbackQueue.setVolume(this.volume, this.isMuted);
      await this.playbackQueue.init();

      await this.captureService.start(
        {
          onAudioLevel: (rms) => this.onAudioLevel(rms),
          onAudioChunk: (base64Pcm) => {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
            this.sendWsMessage({ type: "audio", data: base64Pcm });
          },
          onBargeIn: () => {
            this.playbackQueue.stop();
            this.onStateChange("listening");
          },
          onUserSpeakingStateChange: (isSpeaking) => {
            if (isSpeaking) this.onStateChange("listening");
          },
        },
        () => this.playbackQueue.getIsPlaying()
      );

      await this.wakeLockService.request();
      await this.connectWebSocket();
    } catch (error) {
      console.error("Failed to start Live Session:", error);
      this.stop();
      throw error;
    }
  }

  private executeTool(name: string, args: any): any {
    const state = loadProductivityState();
    const result = executeProductivityTool(name, args, state, () => {});
    if (result.responsePayload?.url) {
      const u = result.responsePayload.url;
      const type = u.includes("whatsapp") ? "whatsapp" : u.includes("youtube") ? "youtube" : "website";
      this.onCommand(u, result.responsePayload.title || name, type);
    }
    return result.responsePayload;
  }

  public sendToolResponse(functionResponses: any[]) {
    this.sendWsMessage({ type: "toolResponse", functionResponses });
  }

  private connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || this.isExplicitlyStopped) {
        resolve();
        return;
      }
      this.isConnecting = true;

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/live`;

      try {
        const socket = new WebSocket(wsUrl);
        this.ws = socket;

        socket.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          const voiceToUse = getSanitizedVoice(this.config.voiceName);
          const initPayload = buildLiveInitMessage({
            assistantName: this.config.assistantName,
            userName: this.config.userName,
            voiceName: voiceToUse,
            systemPrompt: this.config.systemPrompt,
            activeTopicOrScript: this.config.activeTopicOrScript,
          });
          socket.send(JSON.stringify(initPayload));
          this.onStateChange("listening");
          resolve();
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "session_ready") {
              this.onStateChange("listening");
              return;
            }
            if (data.type === "session_error") {
              console.warn("Server Live session error:", data.error);
              return;
            }

            handleLiveServerMessage(data, {
              playbackQueue: this.playbackQueue,
              onListening: () => this.onStateChange("listening"),
              onProcessing: () => this.setAppProcessing(),
              onMessage: this.onMessage,
              onCommand: this.onCommand,
              onVisionIntent: (intent) => this.onVisionIntent?.(intent),
              onExecuteTool: (name, args) => this.executeTool(name, args),
              sendToolResponse: (resps) => this.sendToolResponse(resps),
              clearSafetyTimer: () => {
                if (this.processingSafetyTimer) {
                  clearTimeout(this.processingSafetyTimer);
                  this.processingSafetyTimer = null;
                }
              },
              getLastUserTranscript: () => this.lastUserTranscript,
              setLastUserTranscript: (t) => { this.lastUserTranscript = t; },
            });
          } catch (err) {
            console.error("Live message parse error:", err);
          }
        };

        socket.onclose = () => {
          this.ws = null;
          this.isConnecting = false;
          if (!this.isExplicitlyStopped) {
            this.scheduleReconnect("Live socket disconnected");
          }
        };

        socket.onerror = (err) => {
          console.error("Live WebSocket error:", err);
          this.ws = null;
          this.isConnecting = false;
          if (!this.isExplicitlyStopped) {
            this.scheduleReconnect("Live WebSocket connection error");
          }
          reject(err);
        };
      } catch (err) {
        this.isConnecting = false;
        reject(err);
      }
    });
  }

  private scheduleReconnect(reason?: string) {
    if (this.isExplicitlyStopped) return;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.stop();
      this.onError?.(reason || "Live voice streaming unavailable. Switched to Voice Mode.");
      return;
    }

    this.reconnectAttempts++;
    this.onStateChange("reconnecting");
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 4000);
    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connectWebSocket();
      } catch (e: any) {
        this.scheduleReconnect(e?.message);
      }
    }, delay);
  }

  private sendWsMessage(msg: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(msg));
      } catch (err) {
        console.warn("WS send error:", err);
      }
    }
  }

  public stopPlayback() {
    this.playbackQueue.stop();
  }

  public setAudioStream(stream: MediaStream) {
    this.captureService.setMediaStream(stream);
  }

  stop() {
    this.isExplicitlyStopped = true;
    this.reconnectAttempts = 0;
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
    if (this.processingSafetyTimer) { clearTimeout(this.processingSafetyTimer); this.processingSafetyTimer = null; }
    this.captureService.stop();
    this.playbackQueue.teardown();
    this.wakeLockService.release();
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.boundVisibilityHandler);
    }
    this.onStateChange("idle");
  }

  updateConfig(newConfig: AppConfig) {
    const sanitizedVoice = getSanitizedVoice(newConfig.voiceName);
    newConfig.voiceName = sanitizedVoice;
    this.config = newConfig;

    this.sendWsMessage({
      type: "update_config",
      config: {
        voiceName: sanitizedVoice,
        activeTopicOrScript: newConfig.activeTopicOrScript,
      },
    });
  }

  sendText(text: string) {
    this.sendWsMessage({ type: "text", text });
  }

  sendVideoFrame(base64Jpg: string) {
    this.sendWsMessage({ type: "video", data: base64Jpg });
  }
}
