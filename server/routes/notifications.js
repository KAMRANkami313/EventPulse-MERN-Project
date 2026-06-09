import express from "express";
import { getUserNotifications, markNotificationsRead } from "../controllers/notifications.js";
import { verifyToken } from "../middleware/auth.js";
import { notificationRules } from "../middleware/validate.js";

const router = express.Router();

router.get("/:userId", verifyToken, notificationRules, getUserNotifications);
router.patch("/:userId/read", verifyToken, notificationRules, markNotificationsRead);

export default router;