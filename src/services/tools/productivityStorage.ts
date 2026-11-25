import { ProductivityState, TimerItem, NoteItem, TodoItem, CalendarEventItem } from "../../types/productivity";

const STORAGE_KEY = "zoya_productivity_state";

export function loadProductivityState(): ProductivityState {
  if (typeof window === "undefined") {
    return { timers: [], notes: [], todos: [], events: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { timers: [], notes: [], todos: [], events: [] };
    const parsed = JSON.parse(raw);
    return {
      timers: Array.isArray(parsed.timers) ? parsed.timers : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      todos: Array.isArray(parsed.todos) ? parsed.todos : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
    };
  } catch {
    return { timers: [], notes: [], todos: [], events: [] };
  }
}

export function saveProductivityState(state: ProductivityState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    notifyProductivityUpdated(state);
  } catch (err) {
    console.warn("Failed to persist productivity state:", err);
  }
}

export function notifyProductivityUpdated(state: ProductivityState): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("zoya_productivity_updated", { detail: state }));
  }
}

export function buildGoogleCalendarUrl(
  title: string,
  dateTimeStr: string,
  durationMinutes: number = 30,
  details: string = ""
): string {
  const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const now = new Date();
  
  let eventDate = new Date(dateTimeStr);
  if (isNaN(eventDate.getTime())) {
    eventDate = new Date(now.getTime() + 60 * 60 * 1000);
  }

  const endEventDate = new Date(eventDate.getTime() + durationMinutes * 60 * 1000);

  const formatUtc = (d: Date) =>
    d.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const datesParam = `${formatUtc(eventDate)}/${formatUtc(endEventDate)}`;
  const textParam = encodeURIComponent(title);
  const detailsParam = encodeURIComponent(details);

  return `${base}&text=${textParam}&dates=${datesParam}&details=${detailsParam}`;
}
