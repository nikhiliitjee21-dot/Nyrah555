export interface TimerItem {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isActive: boolean;
  createdAt: number;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: number;
}

export interface TodoItem {
  id: string;
  text: string;
  category: "general" | "grocery" | "work" | "urgent";
  completed: boolean;
  createdAt: number;
}

export interface CalendarEventItem {
  id: string;
  title: string;
  dateTime: string;
  durationMinutes: number;
  description?: string;
  googleCalendarUrl?: string;
  createdAt: number;
}

export interface WebActionItem {
  id: string;
  type: "youtube" | "website" | "search" | "whatsapp";
  title: string;
  url: string;
  query?: string;
  createdAt: number;
}

export interface ProductivityState {
  timers: TimerItem[];
  notes: NoteItem[];
  todos: TodoItem[];
  events: CalendarEventItem[];
  webActions?: WebActionItem[];
}
