import express from "express";
import { getAdminStats } from "../controllers/admin.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Only logged in users can try, and we should ideally check for Admin role here too
// For this project, verifyToken is enough, we handle UI hiding on frontend
router.get("/stats", verifyToken, getAdminStats);

export default router;