/**
 * Role Guard
 * Restricts access to specific user roles.
 * usage: roleGuard('admin', 'manager')
 */
const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated first (authGuard should run before this)
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: User not authenticated" });
    }

    // Check if user has a role and if it's allowed
    // Note: Ensure your JWT payload includes the 'role' field
    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};

module.exports = roleGuard;
