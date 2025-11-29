import express from "express";
import { getUserNotifications, markNotificationsRead } from "../controllers/notifications.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/:userId", verifyToken, getUserNotifications);
router.patch("/:userId/read", verifyToken, markNotificationsRead);

export default router;