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
    getAttendingEvents,
    getFollowingEvents,
    addReview,
    getEventGuests
} from "../controllers/events.js";
import { verifyToken } from "../middleware/auth.js";
import {
    createEventRules,
    getFeedEventsRules,
    objectIdParamRules,
    postCommentRules,
    addReviewRules,
    verifyTicketRules
} from "../middleware/validate.js";
import multer from "multer";
import storage from "../config/cloudinary.js";

const router = express.Router();

// Use Cloudinary Storage
const upload = multer({ storage });

/* READ ROUTES */
// 1. General Feed (with query param validation)
router.get("/", verifyToken, getFeedEventsRules, getFeedEvents);

// 2. Specific Static Routes (MUST come before /:id)
router.get("/user/:userId", verifyToken, objectIdParamRules("userId"), getUserEvents);
router.get("/attending/:userId", verifyToken, objectIdParamRules("userId"), getAttendingEvents);

// FOLLOWING FEED ROUTE
router.get("/following/:userId", verifyToken, objectIdParamRules("userId"), getFollowingEvents);

// ORGANIZER GUEST LIST ROUTE
router.get("/:id/guests", verifyToken, objectIdParamRules("id"), getEventGuests);

// Dynamic ID Route (MUST come last among GETs)
router.get("/:id", verifyToken, objectIdParamRules("id"), getEvent);

/* WRITE ROUTES */
router.post("/", verifyToken, upload.single("picture"), createEventRules, createEvent);
router.post("/verify", verifyToken, verifyTicketRules, verifyTicket);

/* UPDATE ROUTES */
router.patch("/:id/join", verifyToken, objectIdParamRules("id"), joinEvent);
router.post("/:id/comments", verifyToken, postCommentRules, postComment);

// REVIEW ROUTE
router.post("/:id/reviews", verifyToken, addReviewRules, addReview);

router.patch("/:id/like", verifyToken, objectIdParamRules("id"), likeEvent);

/* DELETE ROUTES */
router.delete("/:id", verifyToken, objectIdParamRules("id"), deleteEvent);

export default router;