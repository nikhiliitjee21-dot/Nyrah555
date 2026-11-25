import React from "react";
import { motion } from "motion/react";

type VisualizerState = "idle" | "listening" | "processing" | "speaking" | "reconnecting";

interface VisualizerProps {
  state: VisualizerState;
}

export default function Visualizer({ state }: VisualizerProps) {
  const getSpeed = () => {
    switch (state) {
      case "listening": return 2.0;
      case "processing": return 1.1;
      case "speaking": return 0.55;
      case "reconnecting": return 1.4;
      default: return 6.5;
    }
  };

  const getCoreStyles = () => {
    switch (state) {
      case "listening":
        return {
          glow: "shadow-[0_0_120px_rgba(16,185,129,0.75),0_0_45px_rgba(52,211,153,0.95)]",
          gradient: "radial-gradient(circle at 32% 28%, #f0fdf4 0%, #34d399 35%, #059669 70%, #022c22 100%)",
          waveColor: "border-emerald-400/60 shadow-[0_0_24px_rgba(16,185,129,0.5)]",
          ring1: "border-emerald-400/80 shadow-[0_0_25px_rgba(52,211,153,0.6)]",
          ring2: "border-teal-300/70 shadow-[0_0_20px_rgba(20,184,166,0.5)]",
          nodeColor: "bg-emerald-200 shadow-[0_0_14px_#34d399]",
        };
      case "processing":
        return {
          glow: "shadow-[0_0_130px_rgba(6,182,212,0.85),0_0_55px_rgba(34,211,238,0.95)]",
          gradient: "radial-gradient(circle at 32% 28%, #ecfeff 0%, #22d3ee 35%, #0284c7 70%, #082f49 100%)",
          waveColor: "border-cyan-400/60 shadow-[0_0_24px_rgba(6,182,212,0.5)]",
          ring1: "border-cyan-400/85 shadow-[0_0_25px_rgba(6,182,212,0.7)]",
          ring2: "border-sky-300/75 shadow-[0_0_20px_rgba(56,189,248,0.5)]",
          nodeColor: "bg-cyan-100 shadow-[0_0_14px_#22d3ee]",
        };
      case "speaking":
        return {
          glow: "shadow-[0_0_140px_rgba(244,63,94,0.85),0_0_65px_rgba(251,113,133,0.95)]",
          gradient: "radial-gradient(circle at 32% 28%, #fff1f2 0%, #fb7185 35%, #e11d48 70%, #4c0519 100%)",
          waveColor: "border-rose-400/70 shadow-[0_0_28px_rgba(244,63,94,0.6)]",
          ring1: "border-rose-400/90 shadow-[0_0_25px_rgba(244,63,94,0.7)]",
          ring2: "border-pink-300/80 shadow-[0_0_20px_rgba(244,114,182,0.5)]",
          nodeColor: "bg-rose-100 shadow-[0_0_14px_#fb7185]",
        };
      case "reconnecting":
        return {
          glow: "shadow-[0_0_100px_rgba(245,158,11,0.75),0_0_40px_rgba(251,191,36,0.85)]",
          gradient: "radial-gradient(circle at 32% 28%, #fffbeb 0%, #f59e0b 35%, #d97706 70%, #451a03 100%)",
          waveColor: "border-amber-400/60 shadow-[0_0_24px_rgba(245,158,11,0.5)]",
          ring1: "border-amber-400/85 shadow-[0_0_25px_rgba(245,158,11,0.6)]",
          ring2: "border-orange-300/75 shadow-[0_0_20px_rgba(251,146,60,0.5)]",
          nodeColor: "bg-amber-100 shadow-[0_0_14px_#fbbf24]",
        };
      default:
        return {
          glow: "shadow-[0_0_75px_rgba(99,102,241,0.45),0_0_30px_rgba(129,140,248,0.55)]",
          gradient: "radial-gradient(circle at 32% 28%, #eef2ff 0%, #6366f1 35%, #4338ca 70%, #1e1b4b 100%)",
          waveColor: "border-indigo-400/40 shadow-[0_0_18px_rgba(99,102,241,0.35)]",
          ring1: "border-indigo-400/60 shadow-[0_0_18px_rgba(99,102,241,0.4)]",
          ring2: "border-purple-300/50 shadow-[0_0_15px_rgba(192,132,252,0.3)]",
          nodeColor: "bg-indigo-100 shadow-[0_0_10px_#818cf8]",
        };
    }
  };

  const core = getCoreStyles();
  const speed = getSpeed();

  return (
    <div className="w-full h-full flex items-center justify-center relative [perspective:1400px] select-none pointer-events-none">
      {/* Outer ambient decorative rings */}
      <div className="absolute w-[300px] h-[300px] md:w-[380px] md:h-[380px] rounded-full border border-white/[0.04]" />
      <div className="absolute w-[260px] h-[260px] md:w-[330px] md:h-[330px] rounded-full border border-white/[0.07] border-dashed" />

      {/* Rhythmic Speech / Listening Sound Shockwave Rings */}
      {(state === "speaking" || state === "listening") && (
        <>
          <motion.div
            initial={{ scale: 0.88, opacity: 0.9 }}
            animate={{ scale: [0.95, 2.3], opacity: [0.8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            className={`absolute w-36 h-36 rounded-full border ${core.waveColor}`}
          />
          <motion.div
            initial={{ scale: 0.88, opacity: 0.9 }}
            animate={{ scale: [0.95, 2.3], opacity: [0.8, 0] }}
            transition={{ duration: 1.5, delay: 0.75, repeat: Infinity, ease: "easeOut" }}
            className={`absolute w-36 h-36 rounded-full border ${core.waveColor}`}
          />
        </>
      )}

      {/* 3D Holographic Gyroscope Chamber */}
      <div className="relative w-[240px] h-[240px] md:w-[300px] md:h-[300px] flex items-center justify-center [transform-style:preserve-3d]">
        {/* Ring 1 - Primary orbital track */}
        <motion.div
          animate={{ rotateZ: 360 }}
          transition={{ duration: speed * 1.5, repeat: Infinity, ease: "linear" }}
          className={`absolute w-full h-full rounded-full border-[2px] ${core.ring1}`}
          style={{ transform: "rotateX(72deg) rotateY(25deg)", transformStyle: "preserve-3d" }}
        >
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full ${core.nodeColor}`} />
        </motion.div>

        {/* Ring 2 - Counter orbital track */}
        <motion.div
          animate={{ rotateZ: -360 }}
          transition={{ duration: speed * 1.8, repeat: Infinity, ease: "linear" }}
          className={`absolute w-full h-full rounded-full border-[2px] ${core.ring2}`}
          style={{ transform: "rotateX(72deg) rotateY(-45deg)", transformStyle: "preserve-3d" }}
        >
          <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full ${core.nodeColor}`} />
        </motion.div>

        {/* Ring 3 - Equatorial latitude track */}
        <motion.div
          animate={{ rotateZ: 360 }}
          transition={{ duration: speed * 2.2, repeat: Infinity, ease: "linear" }}
          className="absolute w-[108%] h-[108%] rounded-full border border-white/25 shadow-[0_0_15px_rgba(255,255,255,0.25)]"
          style={{ transform: "rotateX(75deg) rotateY(90deg)", transformStyle: "preserve-3d" }}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_12px_#ffffff]" />
        </motion.div>

        {/* Outer Fine Precision Dial */}
        <motion.div
          animate={{ rotateZ: -360 }}
          transition={{ duration: speed * 3.2, repeat: Infinity, ease: "linear" }}
          className="absolute w-[116%] h-[116%] rounded-full border border-white/10 border-t-white/40"
          style={{ transform: "rotateX(82deg) rotateY(0deg)", transformStyle: "preserve-3d" }}
        />

        {/* Ultra-Luminous Core Crystal Orb */}
        <motion.div
          animate={
            state === "speaking"
              ? { scale: [1, 1.18, 0.94, 1.14, 1] }
              : state === "processing"
              ? { scale: [0.95, 1.07, 0.95] }
              : state === "listening"
              ? { scale: [1, 1.09, 1] }
              : { scale: [1, 1.03, 1] }
          }
          transition={{
            duration: state === "speaking" ? 0.6 : state === "processing" ? 0.9 : 2.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute w-[108px] h-[108px] md:w-[136px] md:h-[136px] rounded-full z-10 transition-all duration-500 ${core.glow}`}
          style={{ background: core.gradient }}
        >
          {/* Internal Specular Glass Highlight */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/15 to-white/80 opacity-75 pointer-events-none" />
          <div className="absolute top-2.5 left-3.5 w-8 h-4.5 rounded-full bg-white/45 blur-[1.5px] rotate-[-28deg] pointer-events-none" />
          <div className="absolute bottom-2 right-3 w-5 h-3 rounded-full bg-white/20 blur-[2px] pointer-events-none" />
        </motion.div>
      </div>
    </div>
  );
}
