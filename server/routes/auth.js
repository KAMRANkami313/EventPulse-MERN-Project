import express from "express";
import {
    register,
    login,
    googleLogin,
    forgotPassword,
    resetPassword,
    changePassword
} from "../controllers/auth.js";
import { verifyToken } from "../middleware/auth.js";
import {
    registerRules,
    loginRules,
    googleLoginRules,
    forgotPasswordRules,
    resetPasswordRules,
    changePasswordRules
} from "../middleware/validate.js";

const router = express.Router();

// Public routes with input validation
router.post("/register", registerRules, register);
router.post("/login", loginRules, login);
router.post("/google", googleLoginRules, googleLogin);
router.post("/forgot-password", forgotPasswordRules, forgotPassword);
router.post("/reset-password/:token", resetPasswordRules, resetPassword);

// Protected route with input validation
router.patch("/change-password", verifyToken, changePasswordRules, changePassword);

export default router;