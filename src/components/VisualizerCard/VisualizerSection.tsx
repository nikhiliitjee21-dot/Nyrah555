import React from "react";
import { Loader2, Globe, Sparkles, Mic } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Visualizer from "../Visualizer";
import { AudioWavePulse } from "./AudioWavePulse";
import { AppState } from "../../types";
import { ChatMessage } from "../../hooks/useVoiceCompanion";

interface VisualizerSectionProps {
  appState: AppState;
  isMicHearing: boolean;
  videoSrc: string | null;
  isSessionActive: boolean;
  onToggleSession: () => void;
  lastMessage?: ChatMessage;
}

export const VisualizerSection: React.FC<VisualizerSectionProps> = ({
  appState,
  isMicHearing,
  videoSrc,
  isSessionActive,
  onToggleSession,
  lastMessage,
}) => {
  return (
    <main className="flex-1 w-full flex flex-col items-center justify-center px-4 md:px-6 relative z-10">
      {/* Floating Status Beacon */}
      <div className="absolute top-2 md:top-4 w-full flex justify-center z-20 pointer-events-none">
        <AnimatePresence mode="wait">
          {appState === "processing" && (
            <motion.div
              key="proc"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="flex items-center gap-2 text-cyan-200 text-xs md:text-sm font-medium bg-[#0D111A]/90 px-4 py-1.5 rounded-full backdrop-blur-2xl border border-cyan-400/30 shadow-[0_10px_35px_rgba(6,182,212,0.25)]"
            >
              <Loader2 size={13} className="animate-spin text-cyan-400" />
              <span className="tracking-wide">Thinking & composing...</span>
            </motion.div>
          )}

          {appState === "listening" && (
            <motion.div
              key="listen"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="flex items-center gap-2.5 text-emerald-200 text-xs md:text-sm font-medium bg-[#0D111A]/90 px-4 py-1.5 rounded-full backdrop-blur-2xl border border-emerald-400/30 shadow-[0_10px_35px_rgba(16,185,129,0.25)]"
            >
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isMicHearing
                    ? "bg-emerald-300 scale-125 shadow-[0_0_12px_#34d399]"
                    : "bg-emerald-400 animate-pulse"
                }`}
              />
              <AudioWavePulse isActive={isMicHearing} color="bg-emerald-400" bars={4} />
              <span className="tracking-wide">{isMicHearing ? "Hearing voice..." : "Listening to you..."}</span>
            </motion.div>
          )}

          {appState === "speaking" && (
            <motion.div
              key="speak"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="flex items-center gap-2.5 text-rose-200 text-xs md:text-sm font-medium bg-[#0D111A]/90 px-4 py-1.5 rounded-full backdrop-blur-2xl border border-rose-400/30 shadow-[0_10px_35px_rgba(244,63,94,0.25)]"
            >
              <AudioWavePulse isActive={true} color="bg-rose-400" bars={5} />
              <span className="tracking-wide">Zoya is speaking...</span>
            </motion.div>
          )}

          {appState === "reconnecting" && (
            <motion.div
              key="rec"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="flex items-center gap-2 text-amber-200 text-xs md:text-sm font-medium bg-[#0D111A]/90 px-4 py-1.5 rounded-full backdrop-blur-2xl border border-amber-400/30 shadow-[0_10px_35px_rgba(245,158,11,0.25)]"
            >
              <Loader2 size={13} className="animate-spin text-amber-400" />
              <span className="tracking-wide">Reconnecting voice stream...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* The Ultra-Luxury Frosted Glass Stage Card */}
      {!videoSrc && (
        <motion.div
          onClick={onToggleSession}
          whileHover={{ scale: 1.012 }}
          whileTap={{ scale: 0.988 }}
          title={isSessionActive ? "Tap to end session" : "Tap to speak with Zoya"}
          className="w-full max-w-[390px] md:max-w-[440px] aspect-[4/5] rounded-[40px] bg-gradient-to-b from-white/[0.07] via-white/[0.025] to-white/[0.008] border border-white/[0.12] shadow-[0_30px_90px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.18)] relative overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all duration-300 p-6 backdrop-blur-3xl group"
        >
          {/* Subtle perimeter specular sweep */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.025] to-transparent opacity-60 pointer-events-none group-hover:opacity-100 transition-opacity" />

          {/* Gyroscope Visualizer */}
          <Visualizer state={appState} />

          {/* Subtitle / Live Transcript Card */}
          <AnimatePresence>
            {lastMessage ? (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.96 }}
                transition={{ duration: 0.22 }}
                className={`absolute bottom-5 px-4 py-3 rounded-2xl max-w-[90%] text-xs md:text-sm text-center shadow-2xl backdrop-blur-2xl flex flex-col items-center gap-1.5 border ${
                  lastMessage.sender === "zoya"
                    ? "bg-[#0E121D]/95 text-white/95 border-white/20 shadow-[0_10px_35px_rgba(0,0,0,0.7)]"
                    : "bg-cyan-950/70 text-cyan-200 border-cyan-400/40 shadow-[0_10px_35px_rgba(6,182,212,0.25)]"
                }`}
              >
                <p className="line-clamp-2 leading-relaxed tracking-wide font-normal">
                  {lastMessage.text}
                </p>

                {lastMessage.sources && lastMessage.sources.length > 0 && (
                  <div className="flex items-center justify-center gap-2 flex-wrap pt-1 border-t border-white/10 w-full text-[11px] text-white/60">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <Globe size={11} /> Google Grounding
                    </span>
                    <span aria-hidden="true">·</span>
                    {lastMessage.sources.slice(0, 2).map((s, idx) => (
                      <a
                        key={idx}
                        href={s.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-cyan-300 hover:text-cyan-200 underline truncate max-w-[130px] transition-colors"
                        title={s.title}
                      >
                        {s.title}
                      </a>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : !isSessionActive ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-6 flex items-center gap-2 text-white/40 text-xs font-normal tracking-wider pointer-events-none"
              >
                <Sparkles size={12} className="text-cyan-400 animate-pulse" />
                <span>Tap stage or button below to speak</span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      )}
    </main>
  );
};
