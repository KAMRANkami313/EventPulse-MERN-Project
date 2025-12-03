import express from "express";
import { getAdminStats, getAllEvents } from "../controllers/admin.js"; // Import getAllEvents
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Route to get overall statistics (Totals, Recents)
router.get("/stats", verifyToken, getAdminStats);

// NEW ROUTE: Route to get all events for the admin table
router.get("/events", verifyToken, getAllEvents); 

export default router;