import { AppConfig, GroundingSource } from "../types";
import { executeProductivityTool } from "./tools/productivityExecutor";
import { loadProductivityState, saveProductivityState } from "./tools/productivityStorage";

export interface ZoyaAnswer {
  text: string;
  sources?: GroundingSource[];
  toolFeedback?: string;
}

export function resetZoyaSession() {
  // Session is maintained stateless or via history array in server chat calls
}

export async function getZoyaResponse(
  prompt: string,
  history: { sender: "user" | "zoya"; text: string }[] = [],
  config: AppConfig
): Promise<ZoyaAnswer> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        history,
        config: {
          userName: config.userName,
          assistantName: config.assistantName,
          systemPrompt: config.systemPrompt,
          activeTopicOrScript: config.activeTopicOrScript,
          googleSearchGrounding: config.googleSearchGrounding !== false,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Chat API error: ${res.status}`);
    }

    const data = await res.json();
    let toolFeedback = "";

    if (data.functionCalls && Array.isArray(data.functionCalls)) {
      const currentState = loadProductivityState();
      for (const call of data.functionCalls) {
        const result = executeProductivityTool(call.name, call.args, currentState, (updated) => {
          saveProductivityState(updated);
        });
        toolFeedback += (toolFeedback ? " " : "") + result.feedbackText;
      }
    }

    const mainText = data.text?.trim() || "";
    const finalText = toolFeedback
      ? (mainText ? `${mainText} ${toolFeedback}` : toolFeedback)
      : (mainText || "Haan ji, maine sun liya.");

    return {
      text: finalText,
      sources: data.sources && data.sources.length > 0 ? data.sources : undefined,
      toolFeedback: toolFeedback || undefined,
    };
  } catch (error) {
    console.error("[geminiService] Chat error:", error);
    return {
      text: "Thoda sa network issue ho gaya hai, ek baar dobara boliye na.",
    };
  }
}

export async function getZoyaAudio(text: string, config: AppConfig): Promise<string | null> {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        voiceName: config.voiceName || "Kore",
      }),
    });

    if (!res.ok) {
      throw new Error(`TTS API error: ${res.status}`);
    }

    const data = await res.json();
    return data.audio || null;
  } catch (error) {
    console.error("[geminiService] TTS error:", error);
    return null;
  }
}
