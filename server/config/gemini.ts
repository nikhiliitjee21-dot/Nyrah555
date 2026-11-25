import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";

if (!apiKey) {
  console.warn("[Gemini Config] Warning: GEMINI_API_KEY environment variable is not set.");
}

export const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    apiVersion: "v1alpha",
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});
