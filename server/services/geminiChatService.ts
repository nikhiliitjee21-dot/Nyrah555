import { ai } from "../config/gemini";
import { SERVER_TOOL_DECLARATIONS } from "./tools/toolDeclarations";

export interface ChatRequestPayload {
  prompt: string;
  history?: { sender: "user" | "zoya"; text: string }[];
  config?: {
    userName?: string;
    assistantName?: string;
    systemPrompt?: string;
    activeTopicOrScript?: string;
    googleSearchGrounding?: boolean;
  };
}

export interface ChatResponsePayload {
  text: string;
  sources?: { title: string; uri: string }[];
  functionCalls?: { name: string; args: any; id?: string }[];
}

export async function handleServerChat(payload: ChatRequestPayload): Promise<ChatResponsePayload> {
  const userName = payload.config?.userName || "Ashwani";
  const assistantName = payload.config?.assistantName || "Zoya";
  const rawPrompt = payload.config?.systemPrompt || `Your name is ${assistantName}. You are a young, confident, witty female companion for ${userName}.`;
  const isGroundingEnabled = payload.config?.googleSearchGrounding !== false;

  const baseInstruction = rawPrompt
    .replace(/{userName}/g, userName)
    .replace(/{assistantName}/g, assistantName);

  const strictPersonaInstruction = `\n\n[MANDATORY FEMALE IDENTITY & VOICE PRESERVATION]
You are strictly a witty, caring, and vibrant female companion named "${assistantName}".
Tone: Playful, sweet, slightly sassy and charming.
Spoken turns: Keep them natural, sweet, and short (1-2 sentences).
Collisquial touches: "Haan ji", "Arey", "Bilkul", "Sach me", "Aap bataiye na".`;

  let topicContext = "";
  if (payload.config?.activeTopicOrScript?.trim()) {
    topicContext = `\n\n[CURRENT FOCUS]: "${payload.config.activeTopicOrScript.trim()}". Weave naturally into conversation.`;
  }

  const systemInstruction = baseInstruction + strictPersonaInstruction + topicContext;

  const toolsList: any[] = [{ functionDeclarations: SERVER_TOOL_DECLARATIONS }];
  if (isGroundingEnabled) {
    toolsList.push({ googleSearch: {} });
  }

  // Format history
  const contents: any[] = [];
  for (const msg of (payload.history || []).slice(-15)) {
    contents.push({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    });
  }
  contents.push({
    role: "user",
    parts: [{ text: payload.prompt }],
  });

  const generateConfig: any = {
    systemInstruction,
    tools: toolsList,
  };

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents,
    config: generateConfig,
  });

  const candidate = response.candidates?.[0];
  const mainText = response.text?.trim() || "";

  // Extract grounding metadata if present
  const sources: { title: string; uri: string }[] = [];
  const groundingChunks = candidate?.groundingMetadata?.groundingChunks;
  if (groundingChunks && Array.isArray(groundingChunks)) {
    for (const chunk of groundingChunks) {
      if (chunk.web?.uri) {
        sources.push({
          title: chunk.web.title || chunk.web.uri,
          uri: chunk.web.uri,
        });
      }
    }
  }

  const functionCalls: { name: string; args: any; id?: string }[] = [];
  if (response.functionCalls && response.functionCalls.length > 0) {
    for (const call of response.functionCalls) {
      functionCalls.push({
        name: call.name || "",
        args: call.args || {},
        id: call.id,
      });
    }
  }

  return {
    text: mainText || "Haan ji, maine sun liya.",
    sources: sources.length > 0 ? sources : undefined,
    functionCalls: functionCalls.length > 0 ? functionCalls : undefined,
  };
}
