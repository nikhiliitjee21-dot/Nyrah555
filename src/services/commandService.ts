export function processCommand(command: string): {
  action: string;
  url?: string;
  isBrowserAction: boolean;
} {
  const lowerCmd = command.toLowerCase().trim();

  // 1. WhatsApp Web commands
  if (lowerCmd.includes("whatsapp")) {
    if (lowerCmd === "whatsapp kholo" || lowerCmd === "open whatsapp" || lowerCmd === "whatsapp web") {
      return {
        action: "Haan ji, main WhatsApp Web open kar rahi hoon!",
        url: "https://web.whatsapp.com",
        isBrowserAction: true,
      };
    }

    const waMatchWithNumber =
      lowerCmd.match(/(?:send|bhejo)\s+(?:a\s+)?whatsapp(?:\s+message)?\s+(?:to|ko)\s+([\d\+\s]+)\s+(?:saying|likho)?\s*(.+)/i) ||
      lowerCmd.match(/whatsapp\s+(?:par|pe)\s+([\d\+\s]+)\s+ko\s+(?:message\s+)?(?:karo|bhejo|likho)?\s*[:\-]?\s*(.+)/i);

    if (waMatchWithNumber) {
      const number = waMatchWithNumber[1].replace(/[\s\+]/g, "");
      const msg = encodeURIComponent(waMatchWithNumber[2].trim());
      return {
        action: "Maine WhatsApp message prepare kar diya hai!",
        url: `https://api.whatsapp.com/send?phone=${number}&text=${msg}`,
        isBrowserAction: true,
      };
    }

    const waGenericMsg =
      lowerCmd.match(/whatsapp\s+(?:pe|par|me)\s+(?:message\s+)?(?:bhejo|likho|karo)?\s*[:\-]?\s*(.+)/i) ||
      lowerCmd.match(/(?:send|type)\s+(.+?)\s+on\s+whatsapp/i);

    if (waGenericMsg && waGenericMsg[1]?.trim()) {
      const cleanMsg = waGenericMsg[1].replace(/^(message|likho|bhejo|send)\s+/i, "").trim();
      return {
        action: `Maine WhatsApp ke liye "${cleanMsg.slice(0, 25)}" type kar diya hai!`,
        url: `https://api.whatsapp.com/send?text=${encodeURIComponent(cleanMsg)}`,
        isBrowserAction: true,
      };
    }
  }

  // 2. Media Search: YouTube
  const ytMatch =
    lowerCmd.match(/^(?:play|chalao|suno|search)\s+(.+?)\s+(?:on|pe|par)\s+youtube$/i) ||
    lowerCmd.match(/youtube\s+(?:pe|par)\s+(.+?)\s+(?:chalao|play|search)/i);
  if (ytMatch) {
    const query = encodeURIComponent(ytMatch[1].trim());
    return {
      action: `Maine YouTube par "${ytMatch[1]}" search kar diya hai!`,
      url: `https://www.youtube.com/results?search_query=${query}`,
      isBrowserAction: true,
    };
  }

  // 3. General Browsing: "Open [website name]"
  const openMatch = lowerCmd.match(/^(?:open|kholo)\s+(.+)$/i);
  if (openMatch && !lowerCmd.includes("youtube") && !lowerCmd.includes("whatsapp")) {
    let website = openMatch[1].trim().replace(/\s+/g, "");
    if (!website.includes(".")) website += ".com";
    return {
      action: `Main ${website} website open karne ka link generate kar rahi hoon!`,
      url: `https://www.${website}`,
      isBrowserAction: true,
    };
  }

  return { action: "", isBrowserAction: false };
}
