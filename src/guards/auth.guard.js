const jwt = require("jsonwebtoken");
const env = require("../config/env");

/**
 * Auth Guard
 * Verifies the JWT token from the Authorization header.
 * If valid, attaches the decoded user to req.user.
 */
const authGuard = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Invalid token format" });
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded; // Attach user to request
    
    next();
  } catch (error) {
    console.error("Auth Guard Error:", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Unauthorized: Token has expired" });
    }
    return res.status(403).json({ error: "Forbidden: Invalid token" });
  }
};

module.exports = authGuard;
