import express from "express";
import { 
    createEvent, 
    getFeedEvents, 
    joinEvent, 
    deleteEvent, 
    postComment, 
    getUserEvents, 
    likeEvent, 
    getEvent, 
    verifyTicket, 
    getAttendingEvents 
} from "../controllers/events.js"; 
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";
import storage from "../config/cloudinary.js"; // ✅ Import Cloud Configuration

const router = express.Router();

// ✅ USE CLOUDINARY STORAGE (Replaces the old diskStorage)
const upload = multer({ storage });

/* READ ROUTES */
// 1. General Feed
router.get("/", verifyToken, getFeedEvents);

// 2. Specific Static Routes (MUST come before /:id)
router.get("/user/:userId", verifyToken, getUserEvents);
router.get("/attending/:userId", verifyToken, getAttendingEvents);

// 3. Dynamic ID Route (MUST come last among GETs)
router.get("/:id", verifyToken, getEvent);

/* WRITE ROUTES */
// ✅ The 'upload' middleware now sends files directly to the Cloud
router.post("/", verifyToken, upload.single("picture"), createEvent);
router.post("/verify", verifyToken, verifyTicket);

/* UPDATE ROUTES */
router.patch("/:id/join", verifyToken, joinEvent);
router.post("/:id/comments", verifyToken, postComment);
router.patch("/:id/like", verifyToken, likeEvent);

/* DELETE ROUTES */
router.delete("/:id", verifyToken, deleteEvent);

export default router;