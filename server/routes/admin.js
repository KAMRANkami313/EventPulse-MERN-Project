import express from "express";
import { getAdminStats, getAllEvents, sendBroadcast, createReport, getReports, resolveReport, getSystemLogs, getTransactions } from "../controllers/admin.js";
import { verifyToken } from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js"; // NEW: Admin-only middleware

const router = express.Router();

// All admin routes now require BOTH authentication AND admin role
// Public route: anyone can submit a report
router.post("/report", verifyToken, createReport);

// Admin-only routes (require verifyToken + isAdmin)
router.get("/stats", verifyToken, isAdmin, getAdminStats);
router.get("/events", verifyToken, isAdmin, getAllEvents);
router.post("/broadcast", verifyToken, isAdmin, sendBroadcast); 
router.get("/reports", verifyToken, isAdmin, getReports);
router.patch("/reports/:id", verifyToken, isAdmin, resolveReport);
router.get("/logs", verifyToken, isAdmin, getSystemLogs); 
router.get("/transactions", verifyToken, isAdmin, getTransactions); 

export default router;