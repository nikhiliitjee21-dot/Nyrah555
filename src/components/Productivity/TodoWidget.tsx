import React, { useState } from "react";
import { CheckCircle2, Circle, Trash2, Plus, ShoppingCart, Briefcase, Zap, CheckSquare } from "lucide-react";
import { TodoItem, ProductivityState } from "../../types/productivity";
import { loadProductivityState, saveProductivityState } from "../../services/tools/productivityStorage";

interface TodoWidgetProps {
  todos: TodoItem[];
}

export const TodoWidget: React.FC<TodoWidgetProps> = ({ todos }) => {
  const [newText, setNewText] = useState("");
  const [category, setCategory] = useState<"general" | "grocery" | "work" | "urgent">("general");

  const toggleTodo = (id: string) => {
    const state = loadProductivityState();
    const updated = state.todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveProductivityState({ ...state, todos: updated });
  };

  const deleteTodo = (id: string) => {
    const state = loadProductivityState();
    const updated = state.todos.filter((t) => t.id !== id);
    saveProductivityState({ ...state, todos: updated });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    const state = loadProductivityState();
    const newItem: TodoItem = {
      id: "todo-" + Date.now(),
      text: newText.trim(),
      category,
      completed: false,
      createdAt: Date.now(),
    };
    saveProductivityState({ ...state, todos: [newItem, ...state.todos] });
    setNewText("");
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "grocery": return <ShoppingCart size={12} className="text-emerald-400" />;
      case "work": return <Briefcase size={12} className="text-cyan-400" />;
      case "urgent": return <Zap size={12} className="text-amber-400" />;
      default: return <CheckSquare size={12} className="text-purple-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleAdd} className="flex gap-2 mb-3">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="New task or grocery item..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          aria-label="Todo Category"
          className="bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs text-white/80 focus:outline-none"
        >
          <option value="general" className="bg-[#181A22]">General</option>
          <option value="grocery" className="bg-[#181A22]">Grocery</option>
          <option value="work" className="bg-[#181A22]">Work</option>
          <option value="urgent" className="bg-[#181A22]">Urgent</option>
        </select>
        <button
          type="submit"
          className="p-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl text-xs transition-colors"
        >
          <Plus size={16} />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[280px]">
        {todos.length === 0 ? (
          <p className="text-center text-xs text-white/40 py-8">
            List empty hai. Boliye: "Zoya, to-do list me dudh aur bread add karo"
          </p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                todo.completed
                  ? "bg-white/[0.02] border-white/5 opacity-50"
                  : "bg-white/5 border-white/10 hover:border-white/20"
              }`}
            >
              <div
                onClick={() => toggleTodo(todo.id)}
                className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
              >
                {todo.completed ? (
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                ) : (
                  <Circle size={16} className="text-white/40 shrink-0" />
                )}
                <span className={`text-xs truncate ${todo.completed ? "line-through text-white/40" : "text-white/90"}`}>
                  {todo.text}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-1 text-[10px] bg-white/5 px-2 py-0.5 rounded-md border border-white/5 capitalize text-white/70">
                  {getCategoryIcon(todo.category)}
                  {todo.category}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-white/40 hover:text-red-400 p-1 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
