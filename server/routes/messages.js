import express from "express";
import { getMessages } from "../controllers/messages.js";
import { verifyToken } from "../middleware/auth.js";
import { getMessagesRules } from "../middleware/validate.js";

const router = express.Router();

router.get("/:eventId", verifyToken, getMessagesRules, getMessages);

export default router;