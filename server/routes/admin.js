import express from "express";
import { getAdminStats, getAllEvents, sendBroadcast, createReport, getReports, resolveReport, getSystemLogs, getTransactions } from "../controllers/admin.js";
import { verifyToken } from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { createReportRules, sendBroadcastRules, objectIdParamRules } from "../middleware/validate.js";

const router = express.Router();

// Public route: anyone can submit a report (with validation)
router.post("/report", verifyToken, createReportRules, createReport);

// Admin-only routes (require verifyToken + isAdmin + validation)
router.get("/stats", verifyToken, isAdmin, getAdminStats);
router.get("/events", verifyToken, isAdmin, getAllEvents);
router.post("/broadcast", verifyToken, isAdmin, sendBroadcastRules, sendBroadcast);
router.get("/reports", verifyToken, isAdmin, getReports);
router.patch("/reports/:id", verifyToken, isAdmin, objectIdParamRules("id"), resolveReport);
router.get("/logs", verifyToken, isAdmin, getSystemLogs);
router.get("/transactions", verifyToken, isAdmin, getTransactions);

export default router;