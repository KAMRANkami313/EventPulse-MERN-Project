import express from "express";
import { 
    register, 
    login, 
    googleLogin, 
    forgotPassword, 
    resetPassword, 
    changePassword // <--- NEW IMPORT
} from "../controllers/auth.js"; 
import { verifyToken } from "../middleware/auth.js"; // <--- IMPORT MIDDLEWARE

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin); 
router.post("/forgot-password", forgotPassword); 
router.post("/reset-password/:token", resetPassword); 

// NEW: CHANGE PASSWORD (Protected)
router.patch("/change-password", verifyToken, changePassword); 

export default router;