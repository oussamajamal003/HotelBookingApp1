/**
 * Ownership Guard
 * Ensures the authenticated user owns the resource they are trying to access.
 * Typically checks if req.user.user_id matches req.params.id
 */
const ownershipGuard = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: User not authenticated" });
    }

    const userIdFromToken = req.user.user_id; // Assumes user_id is in JWT
    const resourceId = parseInt(req.params.id); // Assumes route parameter is :id

    // Check if the ID in the route matches the ID in the token
    // We create a special exception for 'admin' who usually can access everything
    if (req.user.role === 'admin') {
        return next();
    }

    if (userIdFromToken !== resourceId) {
      return res.status(403).json({ error: "Forbidden: You do not own this resource" });
    }

    next();
  } catch (error) {
    console.error("Ownership Guard Error:", error);
    return res.status(500).json({ error: "Server error checking ownership" });
  }
};

module.exports = ownershipGuard;
