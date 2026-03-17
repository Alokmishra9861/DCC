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

const generateToken = (id, secret, expiresIn) =>
  jwt.sign({ id }, secret, { expiresIn });

const parseOptionalInt = (value) => {
  if (value === null) return null;
  if (value === undefined || value === "") return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeString = (value) => {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
};

const normalizeChoice = (value) => {
  const normalized = normalizeString(value);
  return normalized ? normalized.toLowerCase() : null;
};

// ── Register ──────────────────────────────────────────
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
    roleData.association = {
      create: {
        name: profile.name,
        type: profile.type,
        district: profile.district,
        phone: profile.phone,
      },
    };
  } else if (role === "BUSINESS") {
    // ✅ FIX: Resolve category by ID first, then fall back to name match
    const { categoryId, categoryName } = profile;

    let resolvedCategory = null;

    // 1. Try numeric ID (normal path — frontend <select> loaded categories)
    if (categoryId) {
      resolvedCategory = await prisma.category.findUnique({
        where: { id: Number(categoryId) },
      });
    }

    // 2. Fallback: match by name (when categories weren't loaded on frontend)
    if (!resolvedCategory && categoryName) {
      resolvedCategory = await prisma.category.findFirst({
        where: {
          name: { equals: categoryName.trim(), mode: "insensitive" },
        },
      });
    }

    // 3. Neither resolved — reject clearly
    if (!resolvedCategory) {
      throw ApiError.badRequest(
        "Category selection is required for business registration",
      );
    }

    roleData.business = {
      create: {
        name: normalizeString(profile.name),
        categoryId: resolvedCategory.id, // ← always a real DB id
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
    include: {
      member: true,
      employer: true,
      association: true,
      business: true,
      b2bPartner: true,
    },
  });

  // Generate QR for members
  if (role === "MEMBER" && user.member) {
    const qrCode = await generateMemberQR(user.member);
    await prisma.member.update({
      where: { id: user.member.id },
      data: { qrCode },
    });
  }

  // Send welcome email (non-fatal)
  try {
    await sendWelcomeEmail(email, {
      name:
        profile.firstName || profile.companyName || profile.name || "Member",
    });
  } catch (emailErr) {
    console.error("Welcome email failed:", emailErr.message);
  }

  return ApiResponse.created(res, {
    message: "Registration successful. Welcome to DCC!",
  });
});

// ── Login ─────────────────────────────────────────────
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      member: true,
      employer: true,
      association: true,
      business: true,
      b2bPartner: true,
    },
  });

  if (!user) throw ApiError.unauthorized("Invalid email or password");
  if (!user.isActive) throw ApiError.unauthorized("Account is deactivated");
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) throw ApiError.unauthorized("Invalid email or password");

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

  const profile =
    user.member ||
    user.employer ||
    user.association ||
    user.business ||
    user.b2bPartner;

  return ApiResponse.success(
    res,
    {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        profile,
      },
    },
    "Login successful",
  );
});

// ── Verify Email ──────────────────────────────────────
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

// ── Forgot Password ───────────────────────────────────
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return ApiResponse.success(
      res,
      {},
      "If that email exists, a reset link has been sent.",
    );
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetExpiry = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry: resetExpiry },
  });

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

// ── Reset Password ────────────────────────────────────
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
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

// ── Refresh Token ─────────────────────────────────────
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw ApiError.unauthorized("No refresh token provided");

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
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

// ── Get Current User ──────────────────────────────────
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

  const { password, resetToken, emailVerifyToken, ...safeUser } = user;
  return ApiResponse.success(res, safeUser);
});
