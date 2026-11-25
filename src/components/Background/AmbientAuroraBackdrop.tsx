import React from "react";
import { motion } from "motion/react";
import { AppState } from "../../types";

interface AmbientAuroraBackdropProps {
  appState: AppState;
}

export const AmbientAuroraBackdrop: React.FC<AmbientAuroraBackdropProps> = ({ appState }) => {
  const getAuroraPalette = () => {
    switch (appState) {
      case "listening":
        return {
          glowPrimary: "rgba(16, 185, 129, 0.22)",
          glowSecondary: "rgba(6, 182, 212, 0.20)",
          blob1: "from-emerald-500/25 via-teal-500/15 to-transparent",
          blob2: "from-cyan-400/20 via-blue-500/15 to-transparent",
          radialAccent: "#10B981",
        };
      case "speaking":
        return {
          glowPrimary: "rgba(244, 63, 94, 0.26)",
          glowSecondary: "rgba(217, 70, 239, 0.22)",
          blob1: "from-rose-500/30 via-pink-600/20 to-transparent",
          blob2: "from-fuchsia-600/25 via-purple-600/15 to-transparent",
          radialAccent: "#F43F5E",
        };
      case "processing":
        return {
          glowPrimary: "rgba(6, 182, 212, 0.28)",
          glowSecondary: "rgba(139, 92, 246, 0.22)",
          blob1: "from-cyan-400/30 via-blue-600/20 to-transparent",
          blob2: "from-violet-500/25 via-indigo-600/15 to-transparent",
          radialAccent: "#06B6D4",
        };
      case "reconnecting":
        return {
          glowPrimary: "rgba(245, 158, 11, 0.20)",
          glowSecondary: "rgba(234, 88, 12, 0.15)",
          blob1: "from-amber-500/25 via-orange-600/15 to-transparent",
          blob2: "from-yellow-600/20 via-amber-700/10 to-transparent",
          radialAccent: "#F59E0B",
        };
      default:
        return {
          glowPrimary: "rgba(99, 102, 241, 0.12)",
          glowSecondary: "rgba(168, 85, 247, 0.10)",
          blob1: "from-indigo-600/15 via-purple-700/10 to-transparent",
          blob2: "from-fuchsia-800/15 via-violet-900/10 to-transparent",
          radialAccent: "#6366F1",
        };
    }
  };

  const palette = getAuroraPalette();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#05070B]">
      {/* Dynamic Ambient Fluid Mesh Blobs */}
      <motion.div
        animate={{
          x: ["-8%", "12%", "-8%"],
          y: ["-12%", "8%", "-12%"],
          scale: [1, 1.12, 1],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -top-32 -left-32 w-[650px] h-[650px] md:w-[950px] md:h-[950px] rounded-full bg-gradient-to-br ${palette.blob1} blur-[130px] transition-colors duration-1000`}
      />

      <motion.div
        animate={{
          x: ["8%", "-12%", "8%"],
          y: ["12%", "-8%", "12%"],
          scale: [1.1, 0.95, 1.1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -bottom-40 -right-40 w-[650px] h-[650px] md:w-[950px] md:h-[950px] rounded-full bg-gradient-to-tl ${palette.blob2} blur-[140px] transition-colors duration-1000`}
      />

      {/* Central Luminous Core Bloom */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] md:w-[560px] md:h-[560px] rounded-full blur-[110px] transition-all duration-700 pointer-events-none opacity-80"
        style={{
          background: `radial-gradient(circle, ${palette.glowPrimary} 0%, ${palette.glowSecondary} 45%, transparent 70%)`,
        }}
      />

      {/* Subtle luxury vignette to anchor the frame */}
      <div className="absolute inset-0 bg-radial from-transparent via-black/30 to-[#05070B]/90 pointer-events-none" />

      {/* Micro-dot constellation matrix */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.7) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
};
