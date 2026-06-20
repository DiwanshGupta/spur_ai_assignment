import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/chat.controller.js";

const router = Router();

router.post("/message", sendMessage);
router.get("/:sessionId/messages", getMessages);

export default router;