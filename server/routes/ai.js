import express from "express";
import { chatWithAI } from "../controllers/ai.js";
import { verifyToken } from "../middleware/auth.js";
import { chatWithAIRules } from "../middleware/validate.js";

const router = express.Router();

router.post("/chat", verifyToken, chatWithAIRules, chatWithAI);

export default router;