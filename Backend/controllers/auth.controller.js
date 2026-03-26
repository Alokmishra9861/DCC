// Backend/controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { prisma } = require("../config/db.js");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require("../services/email.service");
const { generateMemberQR } = require("../services/qr.service");
const { buildAuthResponse } = require("../utils/auth.redirect");

// ── Helpers ───────────────────────────────────────────────────────────────────
const generateToken = (id, secret, expiresIn) =>
  jwt.sign({ id }, secret, { expiresIn });

const parseOptionalInt = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeString = (value) => {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
};

const normalizeChoice = (value) => {
  const n = normalizeString(value);
  return n ? n.toLowerCase() : null;
};

// Shared include for login — loads all role profiles + membership in one query
const LOGIN_INCLUDE = {
  member: { include: { membership: true } }, // ← membership for membershipStatus
  employer: true,
  association: true, // ← associationType lives here
  business: true,
  b2bPartner: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
exports.register = asyncHandler(async (req, res) => {
  const { email, password, role, profile } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw ApiError.conflict("Email already registered");

  const hashedPassword = await bcrypt.hash(password, 12);
  const emailVerifyToken = crypto.randomBytes(32).toString("hex");

  const allowedRoles = ["MEMBER", "EMPLOYER", "ASSOCIATION", "BUSINESS", "B2B"];
  if (!allowedRoles.includes(role)) throw ApiError.badRequest("Invalid role");

  const roleData = {};

  if (role === "MEMBER") {
    if (!profile?.firstName || !profile?.lastName) {
      throw ApiError.badRequest("First name and last name are required");
    }
    roleData.member = {
      create: {
        firstName: normalizeString(profile.firstName),
        lastName: normalizeString(profile.lastName),
        phone: normalizeString(profile.phone),
        age: parseOptionalInt(profile.age),
        sex: normalizeChoice(profile.sex),
        district: normalizeString(profile.district),
        salaryLevel: normalizeChoice(profile.salaryLevel),
      },
    };
  } else if (role === "EMPLOYER") {
    roleData.employer = {
      create: {
        companyName: profile.companyName,
        industry: profile.industry,
        district: profile.district,
        phone: profile.phone,
      },
    };
  } else if (role === "ASSOCIATION") {
    const validAssocTypes = ["MEMBER", "BUSINESS"];
    const assocType = validAssocTypes.includes(profile.associationType)
      ? profile.associationType
      : "MEMBER"; // default if not sent from signup form

    roleData.association = {
      create: {
        name: profile.name,
        associationType: assocType,
        orgType: profile.type || null,
        district: profile.district || null,
        phone: profile.phone || null,
      },
    };
  } else if (role === "BUSINESS") {
    const { categoryId, categoryName } = profile;
    let resolvedCategory = null;

    if (categoryId) {
      resolvedCategory = await prisma.category.findUnique({
        where: { id: Number(categoryId) },
      });
    }
    if (!resolvedCategory && categoryName) {
      resolvedCategory = await prisma.category.findFirst({
        where: { name: { equals: categoryName.trim(), mode: "insensitive" } },
      });
    }
    if (!resolvedCategory) {
      throw ApiError.badRequest(
        "Category selection is required for business registration",
      );
    }

    roleData.business = {
      create: {
        name: normalizeString(profile.name),
        categoryId: resolvedCategory.id,
        description: normalizeString(profile.description),
        phone: normalizeString(profile.phone),
        email: email,
        address: normalizeString(profile.address),
        district: normalizeString(profile.district),
        website: normalizeString(profile.website),
        status: "PENDING",
      },
    };
  } else if (role === "B2B") {
    roleData.b2bPartner = {
      create: {
        companyName: profile.companyName,
        servicesOffered: profile.servicesOffered,
        phone: profile.phone,
        email: email,
        website: profile.website,
      },
    };
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
      emailVerifyToken,
      ...roleData,
    },
    include: LOGIN_INCLUDE,
  });

  // Generate QR code for new members
  if (role === "MEMBER" && user.member) {
    const qrCode = await generateMemberQR(user.member);
    await prisma.member.update({
      where: { id: user.member.id },
      data: { qrCode },
    });
  }

  // Welcome email — non-fatal
  sendWelcomeEmail(email, {
    name: profile.firstName || profile.companyName || profile.name || "Member",
  }).catch((err) => console.error("Welcome email failed:", err.message));

  // Return a full auth response so the frontend can navigate immediately after signup
  // without needing a separate login call
  const accessToken = generateToken(
    user.id,
    process.env.JWT_SECRET,
    process.env.JWT_EXPIRES_IN || "7d",
  );
  const refreshToken = generateToken(
    user.id,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  );

  return ApiResponse.created(
    res,
    buildAuthResponse(
      { accessToken, refreshToken },
      user,
      user.association, // associationType for ASSOCIATION
      user.member?.membership, // null at signup — that's fine
    ),
    "Registration successful. Welcome to DCC!",
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
exports.login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: LOGIN_INCLUDE,
  });

  if (!user) throw ApiError.unauthorized("Invalid email or password");
  if (!user.isActive) throw ApiError.unauthorized("Account is deactivated");

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) throw ApiError.unauthorized("Invalid email or password");

  // ✅ NEW: Validate that selected role matches user's actual role
  if (role) {
    const selectedRole = role.toUpperCase();
    if (selectedRole !== user.role) {
      throw ApiError.unauthorized(
        `This email is registered as a ${user.role.toLowerCase()}, not ${selectedRole.toLowerCase()}. Please select the correct account type.`,
      );
    }
  }

  const accessToken = generateToken(
    user.id,
    process.env.JWT_SECRET,
    process.env.JWT_EXPIRES_IN || "7d",
  );
  const refreshToken = generateToken(
    user.id,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  );

  return ApiResponse.success(
    res,
    buildAuthResponse(
      { accessToken, refreshToken },
      user,
      user.association, // association.associationType for ASSOCIATION role
      user.member?.membership, // membership.status for MEMBER role
    ),
    "Login successful",
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/verify-email/:token
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token },
  });
  if (!user) throw ApiError.badRequest("Invalid or expired verification token");

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, emailVerifyToken: null },
  });

  return ApiResponse.success(res, {}, "Email verified successfully");
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────────────────────
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  // Always return the same message to avoid email enumeration
  if (!user) {
    return ApiResponse.success(
      res,
      {},
      "If that email exists, a reset link has been sent.",
    );
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry: resetExpiry },
  });

  // Resolve the user's display name without three separate queries
  const profile =
    (await prisma.member.findUnique({ where: { userId: user.id } })) ||
    (await prisma.employer.findUnique({ where: { userId: user.id } })) ||
    (await prisma.association.findUnique({ where: { userId: user.id } }));

  const name =
    profile?.firstName || profile?.companyName || profile?.name || "User";
  await sendPasswordResetEmail(email, name, resetToken);

  return ApiResponse.success(
    res,
    {},
    "If that email exists, a reset link has been sent.",
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// ─────────────────────────────────────────────────────────────────────────────
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
  });
  if (!user) throw ApiError.badRequest("Invalid or expired reset token");

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return ApiResponse.success(res, {}, "Password reset successful");
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/refresh-token
// ─────────────────────────────────────────────────────────────────────────────
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw ApiError.unauthorized("No refresh token provided");

  const decoded = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
  );
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || !user.isActive)
    throw ApiError.unauthorized("Invalid refresh token");

  const newAccessToken = generateToken(
    user.id,
    process.env.JWT_SECRET,
    process.env.JWT_EXPIRES_IN || "7d",
  );
  return ApiResponse.success(
    res,
    { accessToken: newAccessToken },
    "Token refreshed",
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────────────────────────────────────
exports.getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      member: { include: { membership: true } },
      employer: true,
      association: true,
      business: true,
      b2bPartner: true,
    },
  });

  // Strip sensitive fields before sending
  const {
    password,
    resetToken,
    emailVerifyToken,
    resetTokenExpiry,
    ...safeUser
  } = user;
  return ApiResponse.success(res, safeUser);
});
