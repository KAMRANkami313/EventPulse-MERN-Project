import express from "express";
import { getAdminStats, getAllEvents, sendBroadcast, createReport, getReports, resolveReport, getSystemLogs, getTransactions } from "../controllers/admin.js"; // <-- ADDED getTransactions
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

// Audit Logs
router.get("/logs", verifyToken, getSystemLogs); 

// NEW FINANCIAL ROUTE (Phase 29)
router.get("/transactions", verifyToken, getTransactions); 

export default router;