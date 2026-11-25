import { FunctionDeclaration, Type } from "@google/genai";

export const createTimerDeclaration: FunctionDeclaration = {
  name: "createTimer",
  description: "Sets an in-app voice countdown timer or alarm with minutes and an optional label (e.g. 5 minutes for tea, 15 minutes workout).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      minutes: {
        type: Type.NUMBER,
        description: "Duration of the timer in minutes (e.g. 1, 5, 10, 0.5 for 30s).",
      },
      label: {
        type: Type.STRING,
        description: "Label or purpose of the timer (e.g., 'Chai', 'Exercise', 'Focus Session').",
      },
    },
    required: ["minutes"],
  },
};

export const saveNoteDeclaration: FunctionDeclaration = {
  name: "saveNote",
  description: "Saves a voice note, idea, or scratchpad entry to the user's board.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      content: {
        type: Type.STRING,
        description: "The detailed note content or idea to record.",
      },
      title: {
        type: Type.STRING,
        description: "Short title for the note.",
      },
      category: {
        type: Type.STRING,
        description: "Optional category (e.g. 'Personal', 'Work', 'Idea').",
      },
    },
    required: ["content"],
  },
};

export const addTodoDeclaration: FunctionDeclaration = {
  name: "addTodoItem",
  description: "Adds an item to the user's To-Do list or Grocery checklist.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      item: {
        type: Type.STRING,
        description: "Task or grocery item description (e.g. 'Buy milk & eggs', 'Call client at 4 PM').",
      },
      category: {
        type: Type.STRING,
        description: "Category: 'grocery', 'work', 'urgent', or 'general'.",
      },
    },
    required: ["item"],
  },
};

export const createCalendarEventDeclaration: FunctionDeclaration = {
  name: "createCalendarEvent",
  description: "Creates a calendar event or reminder with title, date/time, and direct Google Calendar sync link.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "Event title (e.g. 'Doctor Appointment', 'Meeting with Rohit').",
      },
      dateTime: {
        type: Type.STRING,
        description: "Date and time of the event (e.g. 'Tomorrow 5 PM', '2026-10-05 14:00').",
      },
      durationMinutes: {
        type: Type.NUMBER,
        description: "Estimated duration in minutes (default 30).",
      },
      description: {
        type: Type.STRING,
        description: "Optional details or agenda for the event.",
      },
    },
    required: ["title"],
  },
};

export const searchYouTubeDeclaration: FunctionDeclaration = {
  name: "searchYouTube",
  description: "Searches YouTube for videos, songs, tutorials, or music and generates a direct interactive browser link card for the user.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: "The video or song title or search keywords (e.g. 'Arijit Singh songs', 'Science documentary').",
      },
    },
    required: ["query"],
  },
};

export const openWebsiteDeclaration: FunctionDeclaration = {
  name: "openWebsite",
  description: "Opens or navigates to a specific website URL requested by the user (e.g., 'wikipedia.org', 'google.com', 'github.com', or any web link).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      url: {
        type: Type.STRING,
        description: "The website URL or domain to open (e.g. 'https://wikipedia.org' or 'google.com').",
      },
      title: {
        type: Type.STRING,
        description: "Friendly display title of the website (e.g. 'Wikipedia', 'Google').",
      },
    },
    required: ["url"],
  },
};

export const sendWhatsAppDeclaration: FunctionDeclaration = {
  name: "sendWhatsAppMessage",
  description: "Prepares and opens WhatsApp Web or the WhatsApp app with a typed message pre-filled and ready to send.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      message: {
        type: Type.STRING,
        description: "The text message to type and prepare on WhatsApp.",
      },
      phoneNumber: {
        type: Type.STRING,
        description: "Optional recipient phone number with country code (e.g. '919876543210').",
      },
    },
    required: ["message"],
  },
};

export const openCameraDeclaration: FunctionDeclaration = {
  name: "openCamera",
  description:
    "Automatically opens the user's camera when they ask you to look at something, see their clothes/outfit, inspect their room or surroundings, or read a paper/object in front of them.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      reason: {
        type: Type.STRING,
        description: "What the user wants you to look at.",
      },
    },
  },
};

export const closeCameraDeclaration: FunctionDeclaration = {
  name: "closeCamera",
  description: "Turns off the user's camera when they tell you to close or stop looking.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

export const openScreenShareDeclaration: FunctionDeclaration = {
  name: "openScreenShare",
  description: "Opens screen sharing when the user asks you to look at their computer screen, code, browser tab, or document.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

export const SERVER_TOOL_DECLARATIONS: FunctionDeclaration[] = [
  createTimerDeclaration,
  saveNoteDeclaration,
  addTodoDeclaration,
  createCalendarEventDeclaration,
  searchYouTubeDeclaration,
  openWebsiteDeclaration,
  sendWhatsAppDeclaration,
  openCameraDeclaration,
  closeCameraDeclaration,
  openScreenShareDeclaration,
];
