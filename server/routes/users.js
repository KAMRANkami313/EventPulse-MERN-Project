import express from "express";
import { 
    getUser, 
    getAllUsers, 
    deleteUser, 
    updateUser, 
    addRemoveFriend,
    getUserRecommendations // <--- NEW IMPORT
} from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";
import storage from "../config/cloudinary.js"; // ✅ Import Cloud Configuration

const router = express.Router();

// ✅ USE CLOUDINARY STORAGE
const upload = multer({ storage });

/* READ ROUTES */
router.get("/:id", verifyToken, getUser);
router.get("/", verifyToken, getAllUsers);

// NEW RECOMMENDATIONS ROUTE
router.get("/:id/recommendations", verifyToken, getUserRecommendations); // <--- ADDED THIS

/* DELETE ROUTE */
router.delete("/:id", verifyToken, deleteUser);

/* UPDATE ROUTE */
router.patch("/:id/:friendId", verifyToken, addRemoveFriend);
// ✅ 'upload.single' sends the profile picture to the cloud
router.patch("/:id", verifyToken, upload.single("picture"), updateUser);

export default router;