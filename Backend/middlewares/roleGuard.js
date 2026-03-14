/**
 * Authorize specific roles — must be used AFTER protect middleware
 * Usage: authorize('admin', 'business')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role '${req.user.role}' is not permitted for this action.`,
      });
    }
    next();
  };
};

module.exports = { authorize };
