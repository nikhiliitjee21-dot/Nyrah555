import { AudioPlaybackQueue } from "../audio/AudioPlaybackQueue";
import { detectAndTriggerCommand } from "./commandDetector";
import { detectVisionIntent, VisionIntent } from "../vision/VisionTriggerService";

export interface LiveMessageContext {
  playbackQueue: AudioPlaybackQueue;
  onListening: () => void;
  onProcessing: () => void;
  onMessage: (sender: "user" | "zoya", text: string) => void;
  onCommand: (url: string, title?: string, type?: "youtube" | "website" | "search" | "whatsapp") => void;
  onVisionIntent?: (intent: VisionIntent) => void;
  onExecuteTool?: (name: string, args: any) => any;
  sendToolResponse?: (responses: any[]) => void;
  clearSafetyTimer: () => void;
  getLastUserTranscript: () => string;
  setLastUserTranscript: (text: string) => void;
}

export function handleLiveServerMessage(
  message: any,
  ctx: LiveMessageContext
): void {
  // 1. Tool Call Execution (Forwarded from Server Live API)
  const functionCalls = message.functionCalls || message.toolCall?.functionCalls;
  if (functionCalls && functionCalls.length > 0 && ctx.sendToolResponse) {
    const responses: any[] = [];
    for (const call of functionCalls) {
      const callName = call.name || "";
      let toolResult: any = { status: "success" };
      if (ctx.onExecuteTool && callName) {
        toolResult = ctx.onExecuteTool(callName, call.args || {});
      }
      responses.push({
        id: call.id || "call-" + Date.now(),
        name: callName,
        response: { output: toolResult },
      });
    }
    // Return tool response back to the server WebSocket
    ctx.sendToolResponse(responses);
  }

  // 2. Voice Activity Detection events
  const vaType = message.voiceActivityType || message.voiceActivity?.voiceActivityType;
  if (vaType === "ACTIVITY_START") {
    if (ctx.playbackQueue.getIsPlaying()) {
      ctx.playbackQueue.stop();
    }
    ctx.onListening();
  } else if (vaType === "ACTIVITY_END") {
    ctx.onProcessing();
  }

  // 3. Audio stream chunks (Web Audio API 24kHz)
  if (message.type === "audio" && message.data) {
    ctx.playbackQueue.playChunk(message.data);
  }
  const parts = message.serverContent?.modelTurn?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      ctx.playbackQueue.playChunk(part.inlineData.data);
    }
  }

  // 4. Server-side interruption
  if (message.interrupted || message.serverContent?.interrupted) {
    ctx.playbackQueue.stop();
    ctx.onListening();
  }

  // 5. Turn complete
  if (message.turnComplete || message.serverContent?.turnComplete) {
    ctx.clearSafetyTimer();
    if (!ctx.playbackQueue.getIsPlaying()) {
      ctx.onListening();
    }
  }

  // 6. Companion transcript
  const companionText =
    (message.type === "outputTranscription" ? message.text : null) ||
    message.serverContent?.outputTranscription?.text ||
    message.serverContent?.modelTurn?.parts?.find((p: any) => p.text)?.text;
  if (companionText && companionText.trim()) {
    const text = companionText.trim();
    ctx.onMessage("zoya", text);
    detectAndTriggerCommand(text, ctx.onCommand);
    const intent = detectVisionIntent(text);
    if (intent && ctx.onVisionIntent) {
      ctx.onVisionIntent(intent);
    }
  }

  // 7. User input transcript
  const userText =
    (message.type === "inputTranscription" ? message.text : null) ||
    message.serverContent?.inputTranscription?.text;
  if (userText && userText.trim() && userText.trim() !== ctx.getLastUserTranscript()) {
    const text = userText.trim();
    ctx.setLastUserTranscript(text);
    ctx.onMessage("user", text);
    detectAndTriggerCommand(text, ctx.onCommand);
    const intent = detectVisionIntent(text);
    if (intent && ctx.onVisionIntent) {
      ctx.onVisionIntent(intent);
    }
  }
}
