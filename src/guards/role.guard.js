const logger = require("../utils/logger");

/**
 * Role Guard
 * Restricts access to specific user roles.
 * usage: roleGuard('admin', 'manager')
 */
const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated first (authGuard should run before this)
    if (!req.user) {
      logger.warn(`Role Guard Blocked: Unauthenticated user attempted access to ${req.originalUrl}`);
      return res.status(401).json({ error: "Unauthorized: User not authenticated" });
    }

    // Check if user has a role and if it's allowed
    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      logger.warn(`Role Guard Blocked: User ${req.user.user_id} (${req.user.role}) attempted access to ${req.originalUrl} - Required: ${allowedRoles.join(',')}`);
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};

module.exports = roleGuard;
