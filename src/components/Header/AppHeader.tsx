import React from "react";
import { Settings, Edit3, Volume2, ScrollText, Download, Video, RefreshCw, Trash2, Globe, CheckSquare, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppConfig } from "../../types";

interface AppHeaderProps {
  config: AppConfig;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  onOpenSettings: () => void;
  onOpenVoiceModal: () => void;
  onOpenTopicModal: () => void;
  onToggleSearchGrounding: () => void;
  onOpenProductivity: () => void;
  onInstallApp: () => void;
  isInstalled: boolean;
  videoSrc: string | null;
  onVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveVideo: () => void;
  onUpdateApp: () => void;
  updatingPWA: boolean;
  onClearMemory: () => void;
  liveNotice: string | null;
  onDismissNotice: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  config,
  menuOpen,
  setMenuOpen,
  onOpenSettings,
  onOpenVoiceModal,
  onOpenTopicModal,
  onToggleSearchGrounding,
  onOpenProductivity,
  onInstallApp,
  isInstalled,
  videoSrc,
  onVideoUpload,
  onRemoveVideo,
  onUpdateApp,
  updatingPWA,
  onClearMemory,
  liveNotice,
  onDismissNotice,
}) => {
  return (
    <>
      <header className="w-full flex justify-between items-center z-20 shrink-0 px-4 py-4 md:px-8 md:py-5">
        {/* Left Luxury Branding */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-pulse" />
            <div className="absolute w-5 h-5 rounded-full border border-cyan-400/30 animate-ping" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-semibold tracking-[0.22em] uppercase text-white/95 font-display flex items-center gap-1.5">
              {config.assistantName}
              <span className="text-[10px] tracking-wider text-cyan-400/80 font-normal font-sans border-l border-white/10 pl-2">
                LIVE
              </span>
            </h1>
          </div>
        </div>

        {/* Right Luxury Controls Bar */}
        <div className="flex items-center gap-2">
          {/* Direct Voice Switcher */}
          <button
            onClick={onOpenVoiceModal}
            className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] transition-all border border-white/10 shadow-lg text-white/80 hover:text-white backdrop-blur-xl"
            title="Switch Voice Tone"
          >
            <Volume2 size={16} className="text-rose-300" />
          </button>

          {/* Topic & Focus Script */}
          <button
            onClick={onOpenTopicModal}
            className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] transition-all border border-white/10 shadow-lg relative text-white/80 hover:text-white backdrop-blur-xl"
            title="Focus Topic & Context"
          >
            <ScrollText
              size={16}
              className={config?.activeTopicOrScript?.trim() ? "text-amber-400" : "text-white/80"}
            />
            {config?.activeTopicOrScript?.trim() && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            )}
          </button>

          {/* Productivity Dashboard */}
          <button
            onClick={onOpenProductivity}
            className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] transition-all border border-white/10 shadow-lg text-white/80 hover:text-white backdrop-blur-xl"
            title="Productivity Tools (Notes & Tasks)"
          >
            <CheckSquare size={16} className="text-cyan-300" />
          </button>

          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] transition-all border border-white/10 shadow-lg backdrop-blur-xl"
              title="Settings & Options"
            >
              <Settings size={16} className="text-white/80 hover:text-white" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-[#0E121E]/95 border border-white/15 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] py-2 z-50 overflow-hidden backdrop-blur-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-white/90 hover:bg-white/5 transition-colors flex items-center gap-3"
                  >
                    <Edit3 size={15} className="text-amber-400" />
                    Personalize Prompt & Keys
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onToggleSearchGrounding();
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-white/90 hover:bg-white/5 transition-colors flex items-center justify-between border-t border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <Globe size={15} className="text-emerald-400" />
                      <span>Google Search Grounding</span>
                    </div>
                    <span className={`text-[10px] ${config.googleSearchGrounding !== false ? "text-emerald-300 font-semibold" : "text-white/40"}`}>
                      {config.googleSearchGrounding !== false ? "ON" : "OFF"}
                    </span>
                  </button>

                  {!isInstalled && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onInstallApp();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-cyan-300 hover:bg-white/5 transition-colors flex items-center gap-3 border-t border-white/5"
                    >
                      <Download size={15} />
                      Install Web App
                    </button>
                  )}

                  <label className="w-full text-left px-4 py-2.5 text-xs text-white/90 hover:bg-white/5 transition-colors flex items-center gap-3 cursor-pointer border-t border-white/5">
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        onVideoUpload(e);
                        setMenuOpen(false);
                      }}
                    />
                    <Video size={15} className="text-pink-400" />
                    {videoSrc ? "Change Video Background" : "Upload Video Background"}
                  </label>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onUpdateApp();
                    }}
                    disabled={updatingPWA}
                    className="w-full text-left px-4 py-2.5 text-xs text-emerald-400 hover:bg-white/5 transition-colors flex items-center gap-3 border-t border-white/5"
                  >
                    <RefreshCw size={15} className={updatingPWA ? "animate-spin" : ""} />
                    <span>{updatingPWA ? "Updating..." : "Check For Updates"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onClearMemory();
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-white/5 transition-colors flex items-center gap-3 border-t border-white/5"
                  >
                    <Trash2 size={15} />
                    Clear Chat Memory
                  </button>

                  {videoSrc && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onRemoveVideo();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-white/5 transition-colors flex items-center gap-3 border-t border-white/5"
                    >
                      <Video size={15} />
                      Remove Video Background
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {liveNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-30 max-w-sm w-[90%] px-4 py-2 rounded-2xl bg-[#0E121E]/95 border border-amber-400/40 text-amber-200 text-xs shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-3 text-center"
          >
            <span className="flex-1">{liveNotice}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismissNotice();
              }}
              className="p-1 text-white/50 hover:text-white"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
