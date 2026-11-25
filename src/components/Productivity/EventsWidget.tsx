import React, { useState } from "react";
import { Calendar as CalendarIcon, ExternalLink, Trash2, Plus } from "lucide-react";
import { CalendarEventItem } from "../../types/productivity";
import { loadProductivityState, saveProductivityState, buildGoogleCalendarUrl } from "../../services/tools/productivityStorage";

interface EventsWidgetProps {
  events: CalendarEventItem[];
}

export const EventsWidget: React.FC<EventsWidgetProps> = ({ events }) => {
  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState("");

  const deleteEvent = (id: string) => {
    const state = loadProductivityState();
    const updated = state.events.filter((e) => e.id !== id);
    saveProductivityState({ ...state, events: updated });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const state = loadProductivityState();
    const url = buildGoogleCalendarUrl(title.trim(), dateTime.trim() || "Tomorrow 10 AM");
    const newEvent: CalendarEventItem = {
      id: "event-" + Date.now(),
      title: title.trim(),
      dateTime: dateTime.trim() || "Upcoming",
      durationMinutes: 30,
      googleCalendarUrl: url,
      createdAt: Date.now(),
    };
    saveProductivityState({ ...state, events: [newEvent, ...state.events] });
    setTitle("");
    setDateTime("");
  };

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleAdd} className="flex gap-2 mb-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Meeting ya event ka naam..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
        />
        <input
          type="text"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          placeholder="Date/Time (e.g. Kal 4 PM)"
          className="w-32 bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl text-xs transition-colors shrink-0"
        >
          <Plus size={16} />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[280px]">
        {events.length === 0 ? (
          <p className="text-center text-xs text-white/40 py-8">
            Koi event schedule nahi hai. Boliye: "Zoya, kal sham 6 baje party ka calendar event banao"
          </p>
        ) : (
          events.map((evt) => (
            <div
              key={evt.id}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all flex items-center justify-between gap-2"
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                  <CalendarIcon size={13} className="text-blue-400" />
                  {evt.title}
                </h4>
                <p className="text-[11px] text-white/60 mt-0.5">{evt.dateTime}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {evt.googleCalendarUrl && (
                  <a
                    href={evt.googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 px-2 py-1 rounded-lg border border-blue-500/25 transition-colors"
                  >
                    Google Cal <ExternalLink size={10} />
                  </a>
                )}
                <button
                  onClick={() => deleteEvent(evt.id)}
                  className="text-white/40 hover:text-red-400 p-1 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
