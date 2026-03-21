// Backend/middlewares/associationGuard.js
// Runs AFTER protect middleware.
// Loads the Association record for req.user and blocks restricted
// paths if status !== "APPROVED".

const { prisma } = require("../config/db");
const { ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");

// Routes the pending/rejected association IS allowed to access
const OPEN_PATHS = ["/profile", "/dashboard"];

const associationGuard = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== "ASSOCIATION") {
    throw ApiError.forbidden("Association account required");
  }

  const assoc = await prisma.association.findUnique({
    where: { userId: req.user.id },
    select: { id: true, status: true, associationType: true },
  });

  if (!assoc) throw ApiError.notFound("Association profile not found");

  // Allow profile + dashboard even when pending so the dashboard
  // can show the "awaiting approval" state
  const isOpenPath = OPEN_PATHS.some((p) => req.path.endsWith(p));
  if (assoc.status !== "APPROVED" && !isOpenPath) {
    throw ApiError.forbidden(
      assoc.status === "REJECTED"
        ? "Your association application was rejected. Please contact support."
        : "Your association account is awaiting admin approval.",
    );
  }

  // Attach to req so controllers don't need to re-fetch
  req.association = assoc;
  next();
});

module.exports = associationGuard;
