import {
  ProductivityState,
  TimerItem,
  NoteItem,
  TodoItem,
  CalendarEventItem,
  WebActionItem,
} from "../../types/productivity";
import { loadProductivityState, saveProductivityState, buildGoogleCalendarUrl } from "./productivityStorage";

export interface ToolExecutionResult {
  functionName: string;
  responsePayload: any;
  feedbackText: string;
}

export function executeProductivityTool(
  name: string,
  args: any,
  currentState: ProductivityState,
  onStateUpdate: (newState: ProductivityState) => void
): ToolExecutionResult {
  const state: ProductivityState = {
    timers: [...currentState.timers],
    notes: [...currentState.notes],
    todos: [...currentState.todos],
    events: [...currentState.events],
    webActions: [...(currentState.webActions || [])],
  };

  switch (name) {
    case "createTimer": {
      const minutes = Number(args.minutes) || 1;
      const totalSeconds = Math.max(5, Math.round(minutes * 60));
      const label = args.label?.trim() || `${minutes} min Timer`;

      const newTimer: TimerItem = {
        id: "timer-" + Date.now(),
        label,
        totalSeconds,
        remainingSeconds: totalSeconds,
        isActive: true,
        createdAt: Date.now(),
      };

      state.timers.unshift(newTimer);
      saveProductivityState(state);
      onStateUpdate(state);

      return {
        functionName: name,
        responsePayload: { status: "created", timerId: newTimer.id, label, totalSeconds },
        feedbackText: `Maine "${label}" ka ${minutes} minute ka timer screen par set kar diya hai!`,
      };
    }

    case "saveNote": {
      const content = args.content?.trim() || "";
      const title = args.title?.trim() || content.slice(0, 30) + "...";
      const category = args.category?.trim() || "Quick Note";

      const newNote: NoteItem = {
        id: "note-" + Date.now(),
        title,
        content,
        category,
        createdAt: Date.now(),
      };

      state.notes.unshift(newNote);
      saveProductivityState(state);
      onStateUpdate(state);

      return {
        functionName: name,
        responsePayload: { status: "saved", noteId: newNote.id, title },
        feedbackText: `Aapka note "${title}" save kar liya gaya hai!`,
      };
    }

    case "addTodoItem": {
      const text = args.item?.trim() || "";
      const category = (args.category || "general").toLowerCase() as any;

      const newTodo: TodoItem = {
        id: "todo-" + Date.now(),
        text,
        category: ["grocery", "work", "urgent"].includes(category) ? category : "general",
        completed: false,
        createdAt: Date.now(),
      };

      state.todos.unshift(newTodo);
      saveProductivityState(state);
      onStateUpdate(state);

      return {
        functionName: name,
        responsePayload: { status: "added", todoId: newTodo.id, text },
        feedbackText: `Maine list me "${text}" add kar diya hai!`,
      };
    }

    case "createCalendarEvent": {
      const title = args.title?.trim() || "Reminder";
      const dateTime = args.dateTime?.trim() || "Upcoming";
      const duration = Number(args.durationMinutes) || 30;
      const description = args.description?.trim() || "";
      const googleCalendarUrl = buildGoogleCalendarUrl(title, dateTime, duration, description);

      const newEvent: CalendarEventItem = {
        id: "event-" + Date.now(),
        title,
        dateTime,
        durationMinutes: duration,
        description,
        googleCalendarUrl,
        createdAt: Date.now(),
      };

      state.events.unshift(newEvent);
      saveProductivityState(state);
      onStateUpdate(state);

      return {
        functionName: name,
        responsePayload: { status: "created", eventId: newEvent.id, title, googleCalendarUrl },
        feedbackText: `Maine "${title}" calendar event add kar diya hai aur Google Calendar link generate kar diya hai!`,
      };
    }

    case "searchYouTube": {
      const query = args.query?.trim() || "Trending Videos";
      const cleanUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      const webAction: WebActionItem = {
        id: "web-" + Date.now(),
        type: "youtube",
        title: `YouTube: ${query}`,
        url: cleanUrl,
        query,
        createdAt: Date.now(),
      };
      state.webActions = [webAction, ...(state.webActions || [])];
      saveProductivityState(state);
      onStateUpdate(state);

      return {
        functionName: name,
        responsePayload: { status: "opened", query, url: cleanUrl },
        feedbackText: `Maine YouTube par "${query}" search kar diya hai! Aap screen par diye button se direct dekh sakte hain.`,
      };
    }

    case "openWebsite": {
      let rawUrl = (args.url || "").trim();
      if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
        rawUrl = "https://" + rawUrl;
      }
      const title = args.title?.trim() || rawUrl.replace(/^https?:\/\//, "");
      const webAction: WebActionItem = {
        id: "web-" + Date.now(),
        type: "website",
        title,
        url: rawUrl,
        createdAt: Date.now(),
      };
      state.webActions = [webAction, ...(state.webActions || [])];
      saveProductivityState(state);
      onStateUpdate(state);

      return {
        functionName: name,
        responsePayload: { status: "opened", url: rawUrl, title },
        feedbackText: `Maine "${title}" open karne ke liye screen par card generate kar diya hai!`,
      };
    }

    case "sendWhatsAppMessage": {
      const msg = args.message?.trim() || "";
      const phone = (args.phoneNumber || "").replace(/[^0-9]/g, "");
      const waUrl = phone
        ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;

      const webAction: WebActionItem = {
        id: "web-" + Date.now(),
        type: "whatsapp",
        title: `WhatsApp: ${msg.slice(0, 32)}`,
        url: waUrl,
        query: msg,
        createdAt: Date.now(),
      };
      state.webActions = [webAction, ...(state.webActions || [])];
      saveProductivityState(state);
      onStateUpdate(state);

      return {
        functionName: name,
        responsePayload: { status: "prepared", url: waUrl, message: msg },
        feedbackText: `Maine WhatsApp ke liye aapka message type kar diya hai! Screen par diye button se direct WhatsApp Web me open karke send kar sakte hain.`,
      };
    }

    default:
      return {
        functionName: name,
        responsePayload: { error: "Unknown function" },
        feedbackText: "Ye task main abhi nahi kar sakti.",
      };
  }
}
