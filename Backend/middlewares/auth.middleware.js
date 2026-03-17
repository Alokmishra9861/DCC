const jwt = require("jsonwebtoken");
const { prisma } = require("../config/db");
const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("./errorhandler");

// ── Verify JWT ────────────────────────────────────────
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) throw ApiError.unauthorized("No token provided");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      isEmailVerified: true,
    },
  });

  if (!user) throw ApiError.unauthorized("User no longer exists");
  if (!user.isActive) throw ApiError.unauthorized("Account is deactivated");

  req.user = user;
  next();
});

// ── Role-based access ─────────────────────────────────
const authorize = (...roles) => {
  return (req, res, next) => {
    // If no roles specified, allow all authenticated users
    if (roles.length === 0) {
      return next();
    }
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Role '${req.user.role}' is not authorized to access this route`,
      );
    }
    next();
  };
};

// ── Optional auth (for public routes that benefit from user context) ──
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (user?.isActive) req.user = user;
    } catch (_) {}
  }
  next();
});

module.exports = { protect, authorize, optionalAuth };
