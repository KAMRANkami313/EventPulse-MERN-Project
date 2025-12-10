import express from "express";
import { chatWithAI } from "../controllers/ai.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/chat", verifyToken, chatWithAI);

export default router;