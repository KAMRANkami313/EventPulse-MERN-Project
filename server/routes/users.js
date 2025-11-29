import express from "express";
import { getUser, getAllUsers, deleteUser, updateUser } from "../controllers/users.js"; // Import updateUser
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";

const router = express.Router();

// Multer Config (Same as in events.js)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

router.get("/:id", verifyToken, getUser);
router.get("/", verifyToken, getAllUsers);
router.delete("/:id", verifyToken, deleteUser);

// NEW: Update User Route
router.patch("/:id", verifyToken, upload.single("picture"), updateUser);

export default router;