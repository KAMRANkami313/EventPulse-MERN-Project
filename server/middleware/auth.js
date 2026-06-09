import jwt from "jsonwebtoken";

/**
 * verifyToken Middleware
 * 
 * Extracts JWT from Authorization header, verifies it,
 * and attaches the decoded user payload to req.user.
 * 
 * Proper HTTP status codes:
 * - 401 Unauthorized: Missing or invalid token (authentication failure)
 * - 403 Forbidden: Valid token but insufficient permissions (authorization failure)
 */
export const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    // Tokens usually start with "Bearer ", we want the part after that
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimStart(); // Fixed: trimStart() replaces deprecated trimLeft()
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Attach the user info to the request
    next(); // Proceed to the next function (the controller)
    
  } catch (err) {
    // Authentication errors (expired/invalid token) should return 401, not 500
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token." });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please log in again." });
    }
    res.status(500).json({ error: "Authentication failed." });
  }
};