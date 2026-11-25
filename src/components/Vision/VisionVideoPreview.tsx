import React, { useEffect, useRef, useState } from "react";
import { Camera, Monitor, X, RefreshCw, Eye, Maximize2, Minimize2, Image as ImageIcon } from "lucide-react";
import { motion } from "motion/react";
import { visionService, VisionMode } from "../../services/vision/VisionCaptureService";

interface VisionVideoPreviewProps {
  mode: VisionMode;
  onClose: () => void;
  onSwitchMode: (target: VisionMode) => void;
  assistantName: string;
  isScreenSupported?: boolean;
}

export const VisionVideoPreview: React.FC<VisionVideoPreviewProps> = ({
  mode,
  onClose,
  onSwitchMode,
  assistantName,
  isScreenSupported = true,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (mode === "off" || mode === "photo") return;
    const stream = visionService.getStream();
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.play().catch(() => {});
    }

    const interval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, isMinimized]);

  if (mode === "off") return null;

  return (
    <motion.div
      drag
      dragConstraints={{ left: -150, right: 150, top: -200, bottom: 200 }}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className={`fixed top-20 right-4 z-40 bg-[#0A0D16]/95 border border-cyan-400/40 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_25px_rgba(6,182,212,0.25)] overflow-hidden backdrop-blur-3xl transition-all duration-300 ${
        isMinimized ? "w-48 h-14" : "w-64 md:w-80"
      }`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/40 border-b border-white/10 select-none cursor-move">
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
              pulse ? "bg-cyan-400 scale-125 shadow-[0_0_8px_#22d3ee]" : "bg-cyan-600 scale-100"
            }`}
          />
          <span className="text-[11px] font-semibold text-white truncate flex items-center gap-1">
            <Eye size={12} className="text-cyan-400" />
            {assistantName}'s Eyes
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-white/50 hover:text-white rounded-lg transition-colors"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 text-white/50 hover:text-red-400 rounded-lg transition-colors"
            title="Turn Off Vision"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Video or Snapshot Content */}
      {!isMinimized && (
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {mode === "photo" ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white p-2">
              <ImageIcon size={26} className="text-cyan-400 mb-1" />
              <span className="text-[10px] text-cyan-200">Photo Attached</span>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${mode === "camera" ? "scale-x-[-1]" : ""}`}
            />
          )}

          {/* Real-time Vision Radar Scanning line */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[scan_2s_linear_infinite]" />
          </div>

          {/* Mode Pill Over video */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
            {mode === "camera" && (
              <>
                <Camera size={10} className="text-cyan-400" />
                <span className="text-[9px] text-cyan-200">Webcam Live</span>
              </>
            )}
            {mode === "screen" && (
              <>
                <Monitor size={10} className="text-emerald-400" />
                <span className="text-[9px] text-emerald-200">Screen Share</span>
              </>
            )}
            {mode === "photo" && (
              <>
                <ImageIcon size={10} className="text-purple-400" />
                <span className="text-[9px] text-purple-200">Static Photo</span>
              </>
            )}
          </div>

          {/* Quick Actions overlay */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            {mode === "camera" && (
              <button
                onClick={async () => {
                  const stream = await visionService.switchFacingMode();
                  if (videoRef.current && stream) videoRef.current.srcObject = stream;
                }}
                className="p-1 bg-black/60 hover:bg-black/80 text-white/80 hover:text-white rounded-md backdrop-blur-md border border-white/10 transition-colors"
                title="Flip Camera"
              >
                <RefreshCw size={11} />
              </button>
            )}
            {isScreenSupported && mode !== "screen" && (
              <button
                onClick={() => onSwitchMode("screen")}
                className="px-2 py-0.5 bg-black/60 hover:bg-black/80 text-[10px] text-white/80 hover:text-white rounded-md backdrop-blur-md border border-white/10 transition-colors"
              >
                Screen
              </button>
            )}
            {mode !== "camera" && (
              <button
                onClick={() => onSwitchMode("camera")}
                className="px-2 py-0.5 bg-black/60 hover:bg-black/80 text-[10px] text-white/80 hover:text-white rounded-md backdrop-blur-md border border-white/10 transition-colors"
              >
                Cam
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
