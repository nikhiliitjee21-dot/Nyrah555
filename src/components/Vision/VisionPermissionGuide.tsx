import React, { useRef } from "react";
import { AlertCircle, X, RotateCcw, Upload, Camera } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VisionPermissionGuideProps {
  error: string | null;
  onClose: () => void;
  onPhotoSelected: (file: File) => void;
  onRetryCamera?: () => void;
}

export const VisionPermissionGuide: React.FC<VisionPermissionGuideProps> = ({
  error,
  onClose,
  onPhotoSelected,
  onRetryCamera,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!error) return null;

  const isCameraError = error.toLowerCase().includes("camera");
  const isScreenError = error.toLowerCase().includes("screen");

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md pointer-events-auto">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="bg-[#121622]/98 border border-red-500/40 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col gap-3.5"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <AlertCircle size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {isCameraError ? "Camera Access Needed" : isScreenError ? "Screen Sharing Notice" : "Vision Notice"}
                </h4>
                <span className="text-[11px] text-white/50">Zoya Ki Aankhein (Visual Companion)</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          <div className="bg-black/30 border border-white/5 rounded-2xl p-3.5 text-xs text-white/80 leading-relaxed space-y-2">
            <p className="font-medium text-red-300">{error}</p>
            {isCameraError && (
              <div className="text-[11px] text-white/70 space-y-1 pt-1 border-t border-white/10">
                <p className="font-semibold text-cyan-300">Camera Allow Karne Ka Tarika:</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-white/60">
                  <li>Browser ke top address bar me <b>Lock (🔒)</b> ya site settings icon par tap karein.</li>
                  <li><b>Camera</b> permission ko <b>"Allow"</b> par set karein.</li>
                  <li>Neeche <b>"Retry Camera"</b> button dabayein.</li>
                </ol>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onPhotoSelected(file);
                  onClose();
                }
              }}
            />

            {onRetryCamera && isCameraError && (
              <button
                onClick={() => {
                  onClose();
                  onRetryCamera();
                }}
                className="flex-1 py-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <RotateCcw size={13} />
                Retry Camera
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/15 text-white/90 border border-white/10 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Upload size={13} />
              Take / Upload Photo
            </button>

            <button
              onClick={onClose}
              className="py-2 px-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
