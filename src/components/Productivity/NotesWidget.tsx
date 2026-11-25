import React, { useState } from "react";
import { StickyNote, Trash2, Plus, Calendar } from "lucide-react";
import { NoteItem } from "../../types/productivity";
import { loadProductivityState, saveProductivityState } from "../../services/tools/productivityStorage";

interface NotesWidgetProps {
  notes: NoteItem[];
}

export const NotesWidget: React.FC<NotesWidgetProps> = ({ notes }) => {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");

  const deleteNote = (id: string) => {
    const state = loadProductivityState();
    const updated = state.notes.filter((n) => n.id !== id);
    saveProductivityState({ ...state, notes: updated });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const state = loadProductivityState();
    const newNote: NoteItem = {
      id: "note-" + Date.now(),
      title: title.trim() || content.slice(0, 25) + "...",
      content: content.trim(),
      category: "Personal",
      createdAt: Date.now(),
    };
    saveProductivityState({ ...state, notes: [newNote, ...state.notes] });
    setContent("");
    setTitle("");
  };

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleAdd} className="space-y-2 mb-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title (optional)..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
        />
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Voice note ya quick idea likhein..."
            rows={2}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400 resize-none"
          />
          <button
            type="submit"
            className="px-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs transition-colors flex items-center justify-center shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[260px]">
        {notes.length === 0 ? (
          <p className="text-center text-xs text-white/40 py-8">
            Koi note nahi hai. Boliye: "Zoya, note likho ki kal 10 baje call karna hai"
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 truncate">
                  <StickyNote size={13} />
                  {note.title}
                </span>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-white/40 hover:text-red-400 p-0.5 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <p className="text-xs text-white/80 whitespace-pre-wrap">{note.content}</p>
              <span className="text-[10px] text-white/30 flex items-center gap-1">
                <Calendar size={10} />
                {new Date(note.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
