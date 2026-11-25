import React from "react";
import { Mic, MicOff, Volume2, VolumeX, Keyboard, Send, Sparkles, Loader2, Camera, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppState } from "../../types";
import { VisionMode } from "../../services/vision/VisionCaptureService";

interface VoiceControlsProps {
  assistantName: string;
  appState: AppState;
  isSessionActive: boolean;
  onToggleSession: () => void;
  isMuted: boolean;
  volume: number;
  onVolumeChange: (vol: number) => void;
  onMuteToggle: () => void;
  showVolumeSlider: boolean;
  setShowVolumeSlider: (show: boolean) => void;
  showTextInput: boolean;
  setShowTextInput: (show: boolean) => void;
  textInput: string;
  setTextInput: (text: string) => void;
  onTextSubmit: (e: React.FormEvent) => void;
  visionMode?: VisionMode;
  onToggleCamera?: () => void;
  onToggleScreen?: () => void;
  isScreenSupported?: boolean;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  assistantName,
  appState,
  isSessionActive,
  onToggleSession,
  isMuted,
  volume,
  onVolumeChange,
  onMuteToggle,
  showVolumeSlider,
  setShowVolumeSlider,
  showTextInput,
  setShowTextInput,
  textInput,
  setTextInput,
  onTextSubmit,
  visionMode = "off",
  onToggleCamera,
  onToggleScreen,
  isScreenSupported = true,
}) => {
  return (
    <footer className="w-full flex flex-col items-center justify-end z-30 shrink-0 px-4 pb-6 md:pb-8 pt-2">
      {/* Floating Text Input Box */}
      <AnimatePresence>
        {showTextInput && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md mb-3 px-2"
          >
            <form
              onSubmit={onTextSubmit}
              className="flex items-center gap-2 bg-[#0E121D]/95 border border-white/15 p-2 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`Type a thought to ${assistantName}...`}
                className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-white/35 focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white disabled:opacity-30 disabled:hover:from-cyan-500 disabled:hover:to-blue-600 transition-all shadow-md"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Luxury Glass Island Dock */}
      <div className="w-full max-w-md flex items-center justify-center gap-2 md:gap-3 bg-[#0B0F19]/85 p-2 md:p-2.5 rounded-[32px] border border-white/[0.12] backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.12)]">
        {/* Main Microphone / Session Launcher */}
        <motion.button
          onClick={onToggleSession}
          whileHover={{ scale: 1.018 }}
          whileTap={{ scale: 0.975 }}
          className={`flex-1 relative flex items-center justify-center gap-2.5 py-3.5 md:py-4 px-5 rounded-[24px] font-medium tracking-wide transition-all duration-300 shadow-xl overflow-hidden ${
            isSessionActive
              ? "bg-gradient-to-r from-rose-600/35 to-red-600/35 text-rose-200 border border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.35)]"
              : "bg-gradient-to-r from-white/[0.12] to-white/[0.05] text-white border border-white/20 hover:border-cyan-400/50 hover:bg-white/[0.15] shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          }`}
        >
          {/* Subtle interior specular rim */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/[0.02] to-white/[0.08] pointer-events-none" />

          {appState === "reconnecting" ? (
            <>
              <Loader2 size={17} className="animate-spin text-amber-400" />
              <span className="text-xs md:text-sm font-semibold text-amber-300 tracking-wider">
                Reconnecting...
              </span>
            </>
          ) : isSessionActive ? (
            <>
              <MicOff size={17} className="text-rose-400 animate-pulse" />
              <span className="text-xs md:text-sm font-semibold tracking-wider">
                End Live Call
              </span>
            </>
          ) : (
            <>
              <Sparkles size={16} className="text-cyan-400" />
              <span className="text-xs md:text-sm font-semibold tracking-wider">
                Talk to {assistantName}
              </span>
            </>
          )}
        </motion.button>

        {/* Action Controls Capsule */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Volume Control */}
          <div className="relative">
            <AnimatePresence>
              {showVolumeSlider && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full mb-3 px-3 py-3 bg-[#0E121D] border border-white/15 rounded-2xl shadow-2xl z-50 flex items-center justify-center min-w-[110px] backdrop-blur-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="w-20 accent-cyan-400 cursor-pointer"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVolumeSlider(!showVolumeSlider);
              }}
              className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all border border-white/5"
              title="Volume Level"
            >
              <Volume2 size={16} />
            </button>
          </div>

          {/* Mute Toggle */}
          <button
            onClick={onMuteToggle}
            className={`p-3 rounded-2xl transition-all border ${
              isMuted
                ? "bg-red-500/20 border-red-500/35 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                : "bg-white/[0.04] hover:bg-white/[0.08] border-white/5 text-white/70 hover:text-white"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={16} /> : <Mic size={16} />}
          </button>

          {/* Text Input Toggle */}
          <button
            onClick={() => setShowTextInput(!showTextInput)}
            className={`p-3 rounded-2xl transition-all border ${
              showTextInput
                ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300"
                : "bg-white/[0.04] hover:bg-white/[0.08] border-white/5 text-white/70 hover:text-white"
            }`}
            title="Type to Zoya"
          >
            <Keyboard size={16} />
          </button>

          {/* Camera Button */}
          {onToggleCamera && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCamera();
              }}
              className={`p-3 rounded-2xl transition-all border ${
                visionMode === "camera" || visionMode === "photo"
                  ? "bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-pulse"
                  : "bg-white/[0.04] hover:bg-white/[0.08] border-white/5 text-white/70 hover:text-white"
              }`}
              title="Zoya Ki Aankhein (Live Camera Vision)"
            >
              <Camera size={16} />
            </button>
          )}

          {/* Screen Share Button */}
          {onToggleScreen && isScreenSupported && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleScreen();
              }}
              className={`p-3 rounded-2xl transition-all border ${
                visionMode === "screen"
                  ? "bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.4)] animate-pulse"
                  : "bg-white/[0.04] hover:bg-white/[0.08] border-white/5 text-white/70 hover:text-white"
              }`}
              title="Screen Share Study Buddy"
            >
              <Monitor size={16} />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
