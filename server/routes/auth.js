import express from "express";
import { register, login, googleLogin, forgotPassword, resetPassword } from "../controllers/auth.js"; 

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin); // ✅ NEW ROUTE
router.post("/forgot-password", forgotPassword); // NEW
router.post("/reset-password/:token", resetPassword); // NEW

export default router;