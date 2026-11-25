import React, { useEffect, useState } from "react";
import { Timer, X, Bell } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TimerItem, ProductivityState } from "../../types/productivity";
import { loadProductivityState, saveProductivityState } from "../../services/tools/productivityStorage";

export const LiveTimerWidget: React.FC = () => {
  const [activeTimers, setActiveTimers] = useState<TimerItem[]>([]);

  useEffect(() => {
    const refresh = () => {
      const state = loadProductivityState();
      setActiveTimers(state.timers.filter((t) => t.isActive && t.remainingSeconds > 0));
    };

    refresh();
    window.addEventListener("zoya_productivity_updated", refresh);
    return () => window.removeEventListener("zoya_productivity_updated", refresh);
  }, []);

  // Tick down every second
  useEffect(() => {
    if (activeTimers.length === 0) return;

    const interval = setInterval(() => {
      const state = loadProductivityState();
      let changed = false;

      const updatedTimers = state.timers.map((t) => {
        if (t.isActive && t.remainingSeconds > 0) {
          changed = true;
          const nextRemaining = t.remainingSeconds - 1;
          return {
            ...t,
            remainingSeconds: nextRemaining,
            isActive: nextRemaining > 0,
          };
        }
        return t;
      });

      if (changed) {
        const nextState: ProductivityState = { ...state, timers: updatedTimers };
        saveProductivityState(nextState);
        setActiveTimers(updatedTimers.filter((t) => t.isActive && t.remainingSeconds > 0));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimers.length]);

  const handleDismiss = (id: string) => {
    const state = loadProductivityState();
    const updated = state.timers.map((t) => (t.id === id ? { ...t, isActive: false } : t));
    saveProductivityState({ ...state, timers: updated });
    setActiveTimers(updated.filter((t) => t.isActive && t.remainingSeconds > 0));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (activeTimers.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex flex-col gap-2 w-[90%] max-w-[340px] pointer-events-auto">
      <AnimatePresence>
        {activeTimers.map((timer) => {
          const progress = Math.min(100, Math.max(0, ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) * 100));

          return (
            <motion.div
              key={timer.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-[#181A22]/95 border border-amber-500/30 shadow-2xl rounded-2xl p-3.5 backdrop-blur-xl relative overflow-hidden"
            >
              <div
                className="absolute left-0 bottom-0 top-0 bg-amber-500/10 transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />

              <div className="relative flex items-center justify-between z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Timer size={16} className="animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white truncate max-w-[130px]">{timer.label}</h4>
                    <p className="text-[11px] text-amber-300 font-mono font-medium">{formatTime(timer.remainingSeconds)} left</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                    <Bell size={10} /> Active
                  </span>
                  <button
                    onClick={() => handleDismiss(timer.id)}
                    className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                    title="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
