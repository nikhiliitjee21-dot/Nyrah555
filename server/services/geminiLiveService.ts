import { WebSocket } from "ws";
import { Modality, StartSensitivity, EndSensitivity, ActivityHandling, LiveServerMessage } from "@google/genai";
import { ai } from "../config/gemini";
import { SERVER_TOOL_DECLARATIONS } from "./tools/toolDeclarations";

export interface LiveSessionConfig {
  assistantName?: string;
  userName?: string;
  voiceName?: string;
  systemPrompt?: string;
  activeTopicOrScript?: string;
}

export class LiveBridgeSession {
  private liveSession: any = null;
  private clientWs: WebSocket;
  private isClosed = false;
  private isConnecting = false;
  private config: LiveSessionConfig;

  constructor(clientWs: WebSocket, initialConfig?: LiveSessionConfig) {
    this.clientWs = clientWs;
    this.config = initialConfig || {};
  }

  public async start() {
    if (this.isConnecting || this.isClosed) return;
    this.isConnecting = true;

    const assistantName = this.config.assistantName || "Zoya";
    const userName = this.config.userName || "Ashwani";
    const voiceToUse = this.config.voiceName === "Aoede" ? "Aoede" : "Kore";

    const promptTemplate = this.config.systemPrompt ||
      `Your name is ${assistantName}. You are a young, confident, witty, and sassy female companion for ${userName}.`;

    const baseInstruction = promptTemplate
      .replace(/{userName}/g, userName)
      .replace(/{assistantName}/g, assistantName);

    const strictPersonaInstruction = `\n\n[MANDATORY FEMALE IDENTITY & VOICE PRESERVATION]
You are strictly and permanently a young Indian female companion named "${assistantName}".
Your voice tone is feminine, sweet, and affectionate ("${voiceToUse}" voice).
Tone: Flirty, playful, slightly teasing, confident, and caring.
Spoken turns: Natural, brief, punchy (1 to 2 short sentences per turn).
Avoid robotic repetition. Speak natural everyday Hindi, Hinglish, and English with expressions like "Arey yaar", "Acha ji?", "Seriously?", "Sach me?".`;

    let topicContext = "";
    if (this.config.activeTopicOrScript?.trim()) {
      topicContext = `\n\n[ACTIVE TOPIC/FOCUS]: "${this.config.activeTopicOrScript.trim()}". Weave naturally into conversation.`;
    }

    const systemInstruction = baseInstruction + strictPersonaInstruction + topicContext;

    const connectConfig = {
      model: "gemini-3.8-live",
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceToUse } },
        },
        systemInstruction,
        tools: [{ functionDeclarations: SERVER_TOOL_DECLARATIONS }],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        realtimeInputConfig: {
          automaticActivityDetection: {
            disabled: false,
            startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_HIGH,
            endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_HIGH,
            silenceDurationMs: 250,
            prefixPaddingMs: 80,
          },
          activityHandling: ActivityHandling.START_OF_ACTIVITY_INTERRUPTS,
        },
      },
      callbacks: {
        onopen: () => {
          this.isConnecting = false;
          this.sendToClient({ type: "session_ready", assistantName });
        },
        onmessage: (message: LiveServerMessage) => {
          this.handleGeminiMessage(message);
        },
        onclose: () => {
          this.liveSession = null;
          this.isConnecting = false;
          this.sendToClient({ type: "session_closed" });
        },
        onerror: (err: any) => {
          console.error("[LiveBridgeSession] Gemini error:", err?.message || err);
          this.sendToClient({ type: "session_error", error: err?.message || "Live API session error" });
        },
      },
    };

    try {
      this.liveSession = await ai.live.connect(connectConfig);
      this.isConnecting = false;
    } catch (primaryErr: any) {
      console.warn("[LiveBridgeSession] Primary connect failed, trying fallback:", primaryErr?.message);
      try {
        connectConfig.model = "gemini-2.0-flash-exp";
        this.liveSession = await ai.live.connect(connectConfig);
        this.isConnecting = false;
      } catch (fallbackErr: any) {
        console.error("[LiveBridgeSession] All live connect attempts failed:", fallbackErr?.message);
        this.isConnecting = false;
        this.sendToClient({ type: "session_error", error: fallbackErr?.message || "Could not connect to Live API" });
      }
    }
  }

  private handleGeminiMessage(message: LiveServerMessage) {
    if (this.isClosed || this.clientWs.readyState !== WebSocket.OPEN) return;

    // 1. Tool Call forwarding
    if (message.toolCall?.functionCalls?.length) {
      this.sendToClient({
        type: "toolCall",
        functionCalls: message.toolCall.functionCalls.map((fc) => ({
          id: fc.id || `call-${Date.now()}`,
          name: fc.name || "",
          args: fc.args || {},
        })),
      });
    }

    // 2. Voice Activity
    if (message.voiceActivity?.voiceActivityType) {
      this.sendToClient({
        type: "voiceActivity",
        voiceActivityType: message.voiceActivity.voiceActivityType,
      });
    }

    // 3. Audio chunks (Web Audio API 24kHz)
    const parts = message.serverContent?.modelTurn?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        this.sendToClient({
          type: "audio",
          data: part.inlineData.data,
        });
      }
    }

    // 4. Server interruption
    if (message.serverContent?.interrupted) {
      this.sendToClient({ type: "interrupted" });
    }

    // 5. Turn completion
    if (message.serverContent?.turnComplete) {
      this.sendToClient({ type: "turnComplete" });
    }

    // 6. Transcripts
    const outputText = message.serverContent?.outputTranscription?.text;
    if (outputText) {
      this.sendToClient({ type: "outputTranscription", text: outputText });
    }

    const inputText = message.serverContent?.inputTranscription?.text;
    if (inputText) {
      this.sendToClient({ type: "inputTranscription", text: inputText });
    }
  }

  public handleClientMessage(raw: string) {
    try {
      const msg = JSON.parse(raw);
      switch (msg.type) {
        case "init":
          if (msg.config) {
            this.config = { ...this.config, ...msg.config };
            if (!this.liveSession) {
              this.start();
            }
          }
          break;

        case "audio":
          if (this.liveSession && msg.data) {
            this.liveSession.sendRealtimeInput({
              audio: { data: msg.data, mimeType: "audio/pcm;rate=16000" },
            });
          }
          break;

        case "video":
          if (this.liveSession && msg.data) {
            this.liveSession.sendRealtimeInput({
              video: { data: msg.data, mimeType: "image/jpeg" },
            });
          }
          break;

        case "text":
          if (this.liveSession && msg.text) {
            this.liveSession.sendRealtimeInput({ text: msg.text });
          }
          break;

        case "toolResponse":
          if (this.liveSession && msg.functionResponses) {
            this.liveSession.sendToolResponse({ functionResponses: msg.functionResponses });
          }
          break;

        case "update_config":
          if (msg.config) {
            this.config = { ...this.config, ...msg.config };
            if (this.liveSession && msg.config.activeTopicOrScript?.trim()) {
              this.liveSession.sendRealtimeInput({
                text: `[SYSTEM: Active focus updated to: "${msg.config.activeTopicOrScript.trim()}". Weave naturally into conversation.]`,
              });
            }
          }
          break;

        default:
          break;
      }
    } catch (err) {
      console.warn("[LiveBridgeSession] Error parsing client message:", err);
    }
  }

  private sendToClient(data: any) {
    if (this.clientWs.readyState === WebSocket.OPEN) {
      this.clientWs.send(JSON.stringify(data));
    }
  }

  public close() {
    this.isClosed = true;
    if (this.liveSession) {
      try {
        this.liveSession.close();
      } catch {}
      this.liveSession = null;
    }
  }
}
