import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(403).send("Access Denied");
    }

    // Tokens usually start with "Bearer ", we want the part after that
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Attach the user info to the request
    next(); // Proceed to the next function (the controller)
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};