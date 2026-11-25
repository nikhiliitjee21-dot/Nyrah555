export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AppConfig {
  apiKey?: string;
  userName: string;
  assistantName: string;
  systemPrompt: string;
  voiceName?: string;
  activeTopicOrScript?: string;
  googleSearchGrounding?: boolean;
}

export type AppState = "idle" | "listening" | "processing" | "speaking" | "reconnecting";
