import React, { useState, useEffect } from "react";
import { X, CheckSquare, StickyNote, Calendar, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { ProductivityState } from "../../types/productivity";
import { loadProductivityState } from "../../services/tools/productivityStorage";
import { TodoWidget } from "./TodoWidget";
import { NotesWidget } from "./NotesWidget";
import { EventsWidget } from "./EventsWidget";

interface ProductivityDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "todos" | "notes" | "events";

export const ProductivityDashboard: React.FC<ProductivityDashboardProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("todos");
  const [state, setState] = useState<ProductivityState>(loadProductivityState());

  useEffect(() => {
    const refresh = () => {
      setState(loadProductivityState());
    };
    refresh();
    window.addEventListener("zoya_productivity_updated", refresh);
    return () => window.removeEventListener("zoya_productivity_updated", refresh);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-[#0C101B]/95 border border-white/15 rounded-[32px] shadow-[0_30px_90px_rgba(0,0,0,0.9)] p-6 flex flex-col max-h-[85vh] overflow-hidden backdrop-blur-3xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white font-display">Productivity Hub</h3>
              <p className="text-[11px] text-white/50">Voice tools triggered via Gemini Live</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 p-1 bg-white/[0.04] rounded-2xl my-3.5 border border-white/5">
          <button
            onClick={() => setActiveTab("todos")}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "todos"
                ? "bg-gradient-to-r from-cyan-400 to-teal-400 text-black shadow-md font-semibold"
                : "text-white/60 hover:text-white"
            }`}
          >
            <CheckSquare size={13} />
            To-Do ({state.todos.length})
          </button>

          <button
            onClick={() => setActiveTab("notes")}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "notes"
                ? "bg-gradient-to-r from-amber-400 to-orange-400 text-black shadow-md font-semibold"
                : "text-white/60 hover:text-white"
            }`}
          >
            <StickyNote size={13} />
            Notes ({state.notes.length})
          </button>

          <button
            onClick={() => setActiveTab("events")}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "events"
                ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md font-semibold"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Calendar size={13} />
            Events ({state.events.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden min-h-[300px]">
          {activeTab === "todos" && <TodoWidget todos={state.todos} />}
          {activeTab === "notes" && <NotesWidget notes={state.notes} />}
          {activeTab === "events" && <EventsWidget events={state.events} />}
        </div>
      </motion.div>
    </div>
  );
};
