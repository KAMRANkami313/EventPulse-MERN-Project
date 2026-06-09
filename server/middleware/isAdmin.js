import User from "../models/User.js";

/**
 * isAdmin Middleware
 * 
 * Must be used AFTER verifyToken middleware (which sets req.user).
 * Checks if the authenticated user has the "admin" role.
 * 
 * Usage: router.get("/admin-only", verifyToken, isAdmin, controller)
 */
export const isAdmin = async (req, res, next) => {
  try {
    // req.user is set by verifyToken middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required." });
    }

    // Fetch the user from DB to get the latest role
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: "Server error during authorization check." });
  }
};
