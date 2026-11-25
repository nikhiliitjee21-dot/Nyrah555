import { Request, Response } from "express";
import { handleServerChat } from "../services/geminiChatService";
import { handleServerTts } from "../services/geminiTtsService";

export async function chatController(req: Request, res: Response) {
  try {
    const { prompt, history, config } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'prompt' field." });
    }

    const result = await handleServerChat({
      prompt,
      history: Array.isArray(history) ? history : [],
      config: config || {},
    });

    return res.json(result);
  } catch (error: any) {
    console.error("[ChatController] Error:", error);
    return res.status(500).json({
      error: error?.message || "Internal server error during chat processing.",
      text: "Thoda sa network issue ho gaya hai, ek baar dobara boliye na.",
    });
  }
}

export async function ttsController(req: Request, res: Response) {
  try {
    const { text, voiceName } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'text' field." });
    }

    const audioBase64 = await handleServerTts(text, voiceName);
    if (!audioBase64) {
      return res.status(500).json({ error: "Failed to generate TTS audio." });
    }

    return res.json({ audio: audioBase64 });
  } catch (error: any) {
    console.error("[TtsController] Error:", error);
    return res.status(500).json({ error: error?.message || "Internal server error during TTS." });
  }
}
