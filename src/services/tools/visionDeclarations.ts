import { ToolDeclaration } from "./productivityDeclarations";

export const openCameraDeclaration: ToolDeclaration = {
  name: "openCamera",
  description:
    "Automatically opens the user's camera when they ask you to look at something, see their clothes/outfit, inspect their room or surroundings, or read a paper/object in front of them.",
  parameters: {
    type: "OBJECT",
    properties: {
      reason: {
        type: "STRING",
        description: "What the user wants you to look at.",
      },
    },
  },
};

export const closeCameraDeclaration: ToolDeclaration = {
  name: "closeCamera",
  description: "Turns off the user's camera when they tell you to close or stop looking.",
  parameters: {
    type: "OBJECT",
    properties: {},
  },
};

export const openScreenShareDeclaration: ToolDeclaration = {
  name: "openScreenShare",
  description: "Opens screen sharing when the user asks you to look at their computer screen, code, browser tab, or document.",
  parameters: {
    type: "OBJECT",
    properties: {},
  },
};

export const VISION_FUNCTION_DECLARATIONS: ToolDeclaration[] = [
  openCameraDeclaration,
  closeCameraDeclaration,
  openScreenShareDeclaration,
];
