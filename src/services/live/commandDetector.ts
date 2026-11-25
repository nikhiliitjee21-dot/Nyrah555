export interface DetectedWebCommand {
  type: "youtube" | "website" | "search" | "whatsapp";
  title: string;
  url: string;
}

// Fast client-side command detector to open apps/sites without LLM latency
export function detectAndTriggerCommand(
  text: string,
  onCommand: (url: string, title?: string, type?: "youtube" | "website" | "search" | "whatsapp") => void
): void {
  const lower = text.toLowerCase().trim();

  // 1. WhatsApp commands
  if (lower.includes("whatsapp")) {
    if (
      lower === "whatsapp kholo" ||
      lower === "open whatsapp" ||
      lower === "whatsapp open karo" ||
      lower === "whatsapp web kholo"
    ) {
      onCommand("https://web.whatsapp.com", "WhatsApp Web", "whatsapp");
      return;
    }

    // "whatsapp par [message] bhejo/likho"
    const waMsgMatch =
      lower.match(/whatsapp\s+(?:pe|par|me)\s+(?:message\s+)?(?:karo|bhejo|likho)?\s*[:\-]?\s*(.+)/i) ||
      lower.match(/(?:send|type)\s+(.+?)\s+on\s+whatsapp/i);

    if (waMsgMatch && waMsgMatch[1]?.trim()) {
      const msg = waMsgMatch[1].replace(/^(message|likho|bhejo|send)\s+/i, "").trim();
      const q = encodeURIComponent(msg);
      onCommand(`https://api.whatsapp.com/send?text=${q}`, `WhatsApp: "${msg.slice(0, 30)}"`, "whatsapp");
      return;
    }
  }

  // 2. YouTube specific commands
  if (lower.includes("youtube")) {
    if (
      lower === "youtube kholo" ||
      lower === "open youtube" ||
      lower === "youtube open karo" ||
      lower === "youtube app kholo"
    ) {
      onCommand("https://www.youtube.com", "YouTube", "youtube");
      return;
    }

    const ytMatch =
      lower.match(/youtube\s+(?:pe|par|me)\s+(.+?)(?:\s+(?:search\s+karo|chalao|play|dikhao|dekho))?$/i) ||
      lower.match(/(?:play|chalao|suno|search|dikhao)\s+(.+?)\s+(?:on|pe|par|in)\s+youtube/i) ||
      lower.match(/youtube\s+(.+?)\s+(?:chalao|play|search)/i);

    if (ytMatch && ytMatch[1]?.trim()) {
      const query = ytMatch[1].replace(/^(search|video|gaana|gaane|songs?)\s+/i, "").trim();
      const q = encodeURIComponent(query || "Trending Videos");
      onCommand(`https://www.youtube.com/results?search_query=${q}`, `YouTube: ${query}`, "youtube");
      return;
    }

    const words = lower.replace(/youtube/g, "").replace(/(pe|par|me|chalao|play|kholo|search|karo|open)/g, "").trim();
    if (words) {
      onCommand(`https://www.youtube.com/results?search_query=${encodeURIComponent(words)}`, `YouTube: ${words}`, "youtube");
      return;
    }
  }

  // 3. Google Web Search direct command
  const googleSearchMatch =
    lower.match(/google\s+(?:pe|par)\s+(.+?)\s+search(?:\s+karo)?/i) ||
    lower.match(/search\s+(.+?)\s+on\s+google/i);
  if (googleSearchMatch && googleSearchMatch[1]?.trim()) {
    const q = encodeURIComponent(googleSearchMatch[1].trim());
    onCommand(`https://www.google.com/search?q=${q}`, `Google: ${googleSearchMatch[1].trim()}`, "search");
    return;
  }

  // 4. Direct Website Openings
  const webMatch =
    lower.match(/^(?:open|kholo)\s+([a-zA-Z0-9_\-\.]+)/i) ||
    lower.match(/([a-zA-Z0-9_\-\.]+)\s+(?:website|site)\s+(?:open\s+karo|kholo)/i);

  if (webMatch && !lower.includes("camera") && !lower.includes("screen") && !lower.includes("mic")) {
    let site = webMatch[1].trim().toLowerCase();
    if (site === "google") site = "google.com";
    if (site === "wikipedia") site = "wikipedia.org";
    if (site === "github") site = "github.com";
    if (site === "instagram") site = "instagram.com";
    if (site === "twitter" || site === "x") site = "x.com";
    if (!site.includes(".")) site += ".com";

    onCommand(`https://www.${site}`, site, "website");
  }
}
