import express from "express";
import { getAdminStats, getAllEvents, sendBroadcast, createReport, getReports, resolveReport } from "../controllers/admin.js"; // <-- UPDATED IMPORTS
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Existing Admin Routes
router.get("/stats", verifyToken, getAdminStats);
router.get("/events", verifyToken, getAllEvents);
router.post("/broadcast", verifyToken, sendBroadcast); 

// --- NEW MODERATION ROUTES ---

// USER route (Anyone can report)
router.post("/report", verifyToken, createReport);

// ADMIN routes
router.get("/reports", verifyToken, getReports);
router.patch("/reports/:id", verifyToken, resolveReport);

export default router;