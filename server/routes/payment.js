import express from "express";
import { createCheckoutSession } from "../controllers/payment.js";
import { verifyToken } from "../middleware/auth.js";
import { createCheckoutRules } from "../middleware/validate.js";

const router = express.Router();

router.post("/create-checkout-session", verifyToken, createCheckoutRules, createCheckoutSession);

export default router;