import express from "express";
import {
    getUser,
    getAllUsers,
    deleteUser,
    updateUser,
    toggleFollow,
    getUserRecommendations,
    toggleBookmark,
    getBookmarkedEvents
} from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";
import {
    updateUserRules,
    toggleFollowRules,
    toggleBookmarkRules,
    objectIdParamRules
} from "../middleware/validate.js";
import multer from "multer";
import storage from "../config/cloudinary.js";

const router = express.Router();

// Use Cloudinary Storage
const upload = multer({ storage });

/* READ ROUTES */
router.get("/:id", verifyToken, objectIdParamRules("id"), getUser);
router.get("/", verifyToken, getAllUsers);

// RECOMMENDATIONS ROUTE
router.get("/:id/recommendations", verifyToken, objectIdParamRules("id"), getUserRecommendations);

/* BOOKMARK ROUTES */
router.get("/:id/bookmarks", verifyToken, objectIdParamRules("id"), getBookmarkedEvents);
router.patch("/:id/bookmark/:eventId", verifyToken, toggleBookmarkRules, toggleBookmark);

/* DELETE ROUTE */
router.delete("/:id", verifyToken, objectIdParamRules("id"), deleteUser);

/* UPDATE ROUTES */

// Follow Logic (One-way)
router.patch("/:id/follow/:targetId", verifyToken, toggleFollowRules, toggleFollow);

// Profile update with picture upload
router.patch("/:id", verifyToken, upload.single("picture"), updateUserRules, updateUser);

export default router;