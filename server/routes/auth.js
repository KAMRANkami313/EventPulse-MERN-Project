import express from "express";
import { register, login, googleLogin } from "../controllers/auth.js"; // ✅ Import googleLogin

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin); // ✅ NEW ROUTE

export default router;