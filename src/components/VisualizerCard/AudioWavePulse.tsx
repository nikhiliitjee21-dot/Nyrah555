import React from "react";
import { motion } from "motion/react";

interface AudioWavePulseProps {
  isActive: boolean;
  color?: string;
  bars?: number;
}

export const AudioWavePulse: React.FC<AudioWavePulseProps> = ({
  isActive,
  color = "bg-cyan-400",
  bars = 5,
}) => {
  return (
    <div className="flex items-center gap-[3px] h-4 px-1">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.span
          key={i}
          className={`w-[2.5px] rounded-full ${color}`}
          animate={
            isActive
              ? {
                  height: ["4px", `${10 + ((i * 5) % 8) + 4}px`, "4px"],
                  opacity: [0.5, 1, 0.5],
                }
              : { height: "4px", opacity: 0.3 }
          }
          transition={
            isActive
              ? {
                  duration: 0.45 + (i % 3) * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.08,
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  );
};
