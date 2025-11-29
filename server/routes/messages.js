import express from "express";
import { getMessages } from "../controllers/messages.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/:eventId", verifyToken, getMessages);

export default router;