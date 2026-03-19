// Backend/middlewares/employerGuard.js
// Ensures the authenticated user is an EMPLOYER with an APPROVED account.
// Mount AFTER the protect middleware.

const { prisma } = require("../config/db");
const { ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("./errorhandler");

exports.employerGuard = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "EMPLOYER") {
    throw ApiError.forbidden("Access restricted to employer accounts");
  }

  const employer = await prisma.employer.findUnique({
    where: { userId: req.user.id },
    select: { id: true, status: true, isApproved: true, rejectionReason: true },
  });

  if (!employer) {
    throw ApiError.notFound("Employer profile not found");
  }

  // Check if employer account was rejected
  if (employer.status === "REJECTED") {
    throw ApiError.forbidden(
      employer.rejectionReason
        ? `Your employer account was rejected: ${employer.rejectionReason}`
        : "Your employer account has been rejected. Please contact support.",
    );
  }

  // Allow profile + dashboard reads even while PENDING so they can see their status.
  // Block purchasing and employee management until approved.
  const restrictedPaths = ["/bulk-purchase", "/employees"];

  const isRestricted = restrictedPaths.some((p) => req.path.startsWith(p));

  if (isRestricted && employer.status !== "APPROVED") {
    throw ApiError.forbidden(
      "Your employer account is pending admin approval. " +
        "You will receive an email once approved.",
    );
  }

  // Attach employer info to req for use in controllers
  req.employerId = employer.id;
  req.employerStatus = employer.status;
  next();
});
