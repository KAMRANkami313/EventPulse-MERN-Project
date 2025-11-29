import express from "express";
import { getUser, getAllUsers, deleteUser, updateUser } from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";
import storage from "../config/cloudinary.js"; // ✅ Import Cloud Configuration

const router = express.Router();

// ✅ USE CLOUDINARY STORAGE
const upload = multer({ storage });

/* READ ROUTES */
router.get("/:id", verifyToken, getUser);
router.get("/", verifyToken, getAllUsers);

/* DELETE ROUTE */
router.delete("/:id", verifyToken, deleteUser);

/* UPDATE ROUTE */
// ✅ 'upload.single' sends the profile picture to the cloud
router.patch("/:id", verifyToken, upload.single("picture"), updateUser);

export default router;