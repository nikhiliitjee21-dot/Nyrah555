export interface ToolDeclaration {
  name: string;
  description: string;
  parameters?: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
}

export const createTimerDeclaration: ToolDeclaration = {
  name: "createTimer",
  description: "Sets an in-app voice countdown timer or alarm with minutes and an optional label (e.g. 5 minutes for tea, 15 minutes workout).",
  parameters: {
    type: "OBJECT",
    properties: {
      minutes: {
        type: "NUMBER",
        description: "Duration of the timer in minutes (e.g. 1, 5, 10, 0.5 for 30s).",
      },
      label: {
        type: "STRING",
        description: "Label or purpose of the timer (e.g., 'Chai', 'Exercise', 'Focus Session').",
      },
    },
    required: ["minutes"],
  },
};

export const saveNoteDeclaration: ToolDeclaration = {
  name: "saveNote",
  description: "Saves a voice note, idea, or scratchpad entry to the user's board.",
  parameters: {
    type: "OBJECT",
    properties: {
      content: {
        type: "STRING",
        description: "The detailed note content or idea to record.",
      },
      title: {
        type: "STRING",
        description: "Short title for the note.",
      },
      category: {
        type: "STRING",
        description: "Optional category (e.g. 'Personal', 'Work', 'Idea').",
      },
    },
    required: ["content"],
  },
};

export const addTodoDeclaration: ToolDeclaration = {
  name: "addTodoItem",
  description: "Adds an item to the user's To-Do list or Grocery checklist.",
  parameters: {
    type: "OBJECT",
    properties: {
      item: {
        type: "STRING",
        description: "Task or grocery item description (e.g. 'Buy milk & eggs', 'Call client at 4 PM').",
      },
      category: {
        type: "STRING",
        description: "Category: 'grocery', 'work', 'urgent', or 'general'.",
      },
    },
    required: ["item"],
  },
};

export const createCalendarEventDeclaration: ToolDeclaration = {
  name: "createCalendarEvent",
  description: "Creates a calendar event or reminder with title, date/time, and direct Google Calendar sync link.",
  parameters: {
    type: "OBJECT",
    properties: {
      title: {
        type: "STRING",
        description: "Event title (e.g. 'Doctor Appointment', 'Meeting with Rohit').",
      },
      dateTime: {
        type: "STRING",
        description: "Date and time of the event (e.g. 'Tomorrow 5 PM', '2026-10-05 14:00').",
      },
      durationMinutes: {
        type: "NUMBER",
        description: "Estimated duration in minutes (default 30).",
      },
      description: {
        type: "STRING",
        description: "Optional details or agenda for the event.",
      },
    },
    required: ["title"],
  },
};

export const searchYouTubeDeclaration: ToolDeclaration = {
  name: "searchYouTube",
  description: "Searches YouTube for videos, songs, tutorials, or music and generates a direct interactive browser link card for the user.",
  parameters: {
    type: "OBJECT",
    properties: {
      query: {
        type: "STRING",
        description: "The video or song title or search keywords (e.g. 'Arijit Singh songs', 'Science documentary').",
      },
    },
    required: ["query"],
  },
};

export const openWebsiteDeclaration: ToolDeclaration = {
  name: "openWebsite",
  description: "Opens or navigates to a specific website URL requested by the user (e.g., 'wikipedia.org', 'google.com', 'github.com', or any web link).",
  parameters: {
    type: "OBJECT",
    properties: {
      url: {
        type: "STRING",
        description: "The website URL or domain to open (e.g. 'https://wikipedia.org' or 'google.com').",
      },
      title: {
        type: "STRING",
        description: "Friendly display title of the website (e.g. 'Wikipedia', 'Google').",
      },
    },
    required: ["url"],
  },
};

export const sendWhatsAppDeclaration: ToolDeclaration = {
  name: "sendWhatsAppMessage",
  description: "Prepares and opens WhatsApp Web or the WhatsApp app with a typed message pre-filled and ready to send.",
  parameters: {
    type: "OBJECT",
    properties: {
      message: {
        type: "STRING",
        description: "The text message to type and prepare on WhatsApp.",
      },
      phoneNumber: {
        type: "STRING",
        description: "Optional recipient phone number with country code (e.g. '919876543210').",
      },
    },
    required: ["message"],
  },
};

export const PRODUCTIVITY_FUNCTION_DECLARATIONS: ToolDeclaration[] = [
  createTimerDeclaration,
  saveNoteDeclaration,
  addTodoDeclaration,
  createCalendarEventDeclaration,
  searchYouTubeDeclaration,
  openWebsiteDeclaration,
  sendWhatsAppDeclaration,
];
