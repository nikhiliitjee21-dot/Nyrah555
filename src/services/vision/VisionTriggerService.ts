export type VisionIntent = "open_camera" | "close_camera" | "open_screen" | null;

export function detectVisionIntent(text: string): VisionIntent {
  if (!text || typeof text !== "string") return null;
  const lower = text.toLowerCase().trim();

  // Screen share triggers
  if (
    lower.includes("screen dekho") ||
    lower.includes("screen share") ||
    lower.includes("meri screen") ||
    lower.includes("share screen") ||
    lower.includes("share my screen")
  ) {
    return "open_screen";
  }

  // Camera close triggers
  if (
    lower.includes("camera band") ||
    lower.includes("camera off") ||
    lower.includes("camera close") ||
    lower.includes("camera stop") ||
    lower.includes("aankh band") ||
    lower.includes("aankhein band") ||
    lower.includes("mat dekho") ||
    lower.includes("close camera") ||
    lower.includes("close the camera") ||
    lower.includes("turn off camera") ||
    lower.includes("stop camera")
  ) {
    return "close_camera";
  }

  // Camera open / look triggers (Hindi, Hinglish, English)
  const openCameraPatterns = [
    /dekh\s*(kar|karke|ke)?\s*bata/i,
    /(mera|meri|mere|ye|yeh|is|ise|isko|humara)\s+.*(dekh|dekho|dekhna)/i,
    /camera\s*(on|kholo|chalu|open|start)/i,
    /(aankh|aankhein)\s*(kholo|open)/i,
    /kuch\s+(dekh|dekho)/i,
    /dekh\s*sakti\s*ho/i,
    /kaisi\s+lag\s+rahi\s+hai/i,
    /kaisa\s+lag\s+raha\s+hai/i,
    /look\s+at/i,
    /can\s+you\s+see/i,
    /open\s+(the\s+)?camera/i,
    /turn\s+on\s+(the\s+)?camera/i,
    /check\s+(my|this)\s+(outfit|dress|shirt|t-shirt|face|hair|look)/i,
    /take\s+a\s+look/i,
  ];

  for (const pattern of openCameraPatterns) {
    if (pattern.test(lower)) {
      return "open_camera";
    }
  }

  return null;
}
