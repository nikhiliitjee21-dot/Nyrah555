import React, { useEffect } from "react";
import { ExternalLink, Play, Globe, X, Search, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { WebActionItem } from "../../types/productivity";

interface WebActionCardProps {
  action: WebActionItem | null;
  onDismiss: () => void;
}

export const WebActionCard: React.FC<WebActionCardProps> = ({ action, onDismiss }) => {
  useEffect(() => {
    if (!action) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 20000);
    return () => clearTimeout(timer);
  }, [action, onDismiss]);

  if (!action) return null;

  const isYouTube = action.type === "youtube";
  const isSearch = action.type === "search";
  const isWhatsApp = action.type === "whatsapp";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="fixed bottom-28 md:bottom-32 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md bg-[#121622]/95 border border-white/15 rounded-3xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                isWhatsApp
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : isYouTube
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : isSearch
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              }`}
            >
              {isWhatsApp ? (
                <MessageSquare size={20} />
              ) : isYouTube ? (
                <Play size={20} className="fill-current ml-0.5" />
              ) : isSearch ? (
                <Search size={20} />
              ) : (
                <Globe size={20} />
              )}
            </div>

            <div className="min-w-0">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-white/50 block">
                {isWhatsApp
                  ? "WhatsApp Direct Message"
                  : isYouTube
                  ? "YouTube Video Request"
                  : isSearch
                  ? "Google Search"
                  : "Website Link"}
              </span>
              <h4 className="text-sm font-medium text-white truncate max-w-[220px] md:max-w-[260px]">
                {action.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={action.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onDismiss()}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
                isWhatsApp
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : isYouTube
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-cyan-500 hover:bg-cyan-400 text-black font-medium"
              }`}
            >
              <span>{isWhatsApp ? "Send" : "Open"}</span>
              <ExternalLink size={13} />
            </a>

            <button
              onClick={onDismiss}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
