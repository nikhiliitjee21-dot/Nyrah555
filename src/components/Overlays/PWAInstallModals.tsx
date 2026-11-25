import React from "react";
import { Download } from "lucide-react";

interface PWAInstallModalsProps {
  assistantName: string;
  showIOSGuide: boolean;
  onCloseIOSGuide: () => void;
  showAndroidGuide: boolean;
  onCloseAndroidGuide: () => void;
}

export const PWAInstallModals: React.FC<PWAInstallModalsProps> = ({
  assistantName,
  showIOSGuide,
  onCloseIOSGuide,
  showAndroidGuide,
  onCloseAndroidGuide,
}) => {
  return (
    <>
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#181A22] p-8 border border-white/10 shadow-2xl flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-2">
              <Download size={32} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-white mb-2">Install on iOS</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                To install {assistantName} on your iPhone or iPad:
                <br />
                <br />
                1. Tap the <strong>Share</strong> button in the Safari toolbar at the bottom.
                <br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
            </div>
            <button
              onClick={onCloseIOSGuide}
              className="w-full py-3 mt-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#181A22] p-8 border border-white/10 shadow-2xl flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-2">
              <Download size={32} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-white mb-2">Install App</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                To install {assistantName} on your device:
                <br />
                <br />
                1. Tap the <strong>Browser Menu</strong> (three dots ⋮) at the top right.
                <br />
                2. Tap <strong>Install app</strong> or <strong>Add to Home Screen</strong>.
              </p>
            </div>
            <button
              onClick={onCloseAndroidGuide}
              className="w-full py-3 mt-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
