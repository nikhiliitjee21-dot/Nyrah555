import { GroundingSource } from "../../types";

export interface ExtractedGrounding {
  sources: GroundingSource[];
  searchQueries?: string[];
}

// Extracts Google Search grounding chunks (web links, titles) from Gemini API response
export function extractGroundingSources(responseCandidate: any): ExtractedGrounding {
  const metadata = responseCandidate?.groundingMetadata;
  if (!metadata) return { sources: [] };

  const sources: GroundingSource[] = [];
  const chunks = metadata.groundingChunks || [];

  for (const chunk of chunks) {
    if (chunk.web?.uri) {
      sources.push({
        title: chunk.web.title || new URL(chunk.web.uri).hostname,
        uri: chunk.web.uri,
      });
    }
  }

  const searchQueries: string[] = metadata.webSearchQueries || [];
  return { sources, searchQueries };
}

// Directive added when Google Search Grounding is enabled
export const SEARCH_GROUNDING_DIRECTIVE = `

[REAL-TIME LIVE WORLD KNOWLEDGE VIA GOOGLE SEARCH]
1. You have live, real-time Google Search access to the internet.
2. Whenever the user asks about today's weather, breaking news, live sports scores, current date/year (2025/2026), latest movies, stock market or real-time events, use your Google Search grounding to give accurate, updated information.
3. Keep your answer brief, conversational, and sweet in your natural speaking style. Do not recite long URLs or raw code.`;
