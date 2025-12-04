import express from "express";
import { getAdminStats, getAllEvents, sendBroadcast, createReport, getReports, resolveReport, getSystemLogs } from "../controllers/admin.js"; // <-- ADDED getSystemLogs
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Existing Admin Routes
router.get("/stats", verifyToken, getAdminStats);
router.get("/events", verifyToken, getAllEvents);
router.post("/broadcast", verifyToken, sendBroadcast); 

// Moderation Routes
router.post("/report", verifyToken, createReport);
router.get("/reports", verifyToken, getReports);
router.patch("/reports/:id", verifyToken, resolveReport);

// NEW AUDIT LOG ROUTE (Phase 26)
router.get("/logs", verifyToken, getSystemLogs); 

export default router;