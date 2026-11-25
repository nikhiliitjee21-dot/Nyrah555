import React from "react";

interface VideoBackgroundLayerProps {
  videoSrc: string | null;
}

export const VideoBackgroundLayer: React.FC<VideoBackgroundLayerProps> = ({ videoSrc }) => {
  if (!videoSrc) return null;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black flex items-center justify-center">
      {/* Blurred background layer for aspect ratio fill */}
      <video
        src={videoSrc}
        autoPlay
        loop
        muted={true}
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-40 blur-2xl scale-110"
      />
      {/* Main video layer contained */}
      <video
        src={videoSrc}
        autoPlay
        loop
        muted={true}
        playsInline
        className="relative w-full h-full object-contain opacity-90 z-10"
      />
    </div>
  );
};
