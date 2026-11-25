import { Router } from "express";
import { chatController, ttsController } from "../controllers/chatController";

export const apiRouter = Router();

apiRouter.post("/chat", chatController);
apiRouter.post("/tts", ttsController);
