// Client-side Live configuration helpers without @google/genai imports

export interface LiveClientConfigOptions {
  assistantName: string;
  userName: string;
  voiceName: string;
  systemPrompt: string;
  activeTopicOrScript?: string;
}

export function buildLiveInitMessage(options: LiveClientConfigOptions) {
  return {
    type: "init",
    config: {
      assistantName: options.assistantName,
      userName: options.userName,
      voiceName: options.voiceName,
      systemPrompt: options.systemPrompt,
      activeTopicOrScript: options.activeTopicOrScript,
    },
  };
}
