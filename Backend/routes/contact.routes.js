const express = require("express");
const router = express.Router();
const { prisma } = require("../config/db");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const { protect, authorize } = require("../middlewares/auth.middleware");
const {
  sendContactSubmissionEmail,
  sendContactConfirmationEmail,
} = require("../services/email.service");

// POST /api/contact — submit inquiry (public)
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, phone, subject, message, type } = req.body;
    if (!name || !email || !subject || !message) {
      throw ApiError.badRequest(
        "Please provide name, email, subject and message",
      );
    }
    const inquiry = await prisma.contactInquiry.create({
      data: { name, email, phone, subject, message, type },
    });

    // Send emails
    try {
      // Send notification to admin
      await sendContactSubmissionEmail({
        name,
        email,
        phone,
        subject,
        message,
      });
      // Send confirmation to user
      await sendContactConfirmationEmail(email, { name });
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
      // Don't throw error — inquiry is saved, just log email failure
    }

    return ApiResponse.created(
      res,
      inquiry,
      "Your message has been received. We will get back to you soon!",
    );
  }),
);

// GET /api/contact — list all inquiries (admin)
router.get(
  "/",
  protect,
  authorize("ADMIN"),
  asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = status ? { status } : {};
    const [inquiries, total] = await Promise.all([
      prisma.contactInquiry.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.contactInquiry.count({ where }),
    ]);
    return ApiResponse.success(res, {
      inquiries,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  }),
);

// PUT /api/contact/:id/status — update status (admin)
router.put(
  "/:id/status",
  protect,
  authorize("ADMIN"),
  asyncHandler(async (req, res) => {
    const { status, response } = req.body;
    const data = {
      status,
      ...(response && { response }),
      ...(status === "responded" && { respondedAt: new Date() }),
    };
    const inquiry = await prisma.contactInquiry.update({
      where: { id: req.params.id },
      data,
    });
    return ApiResponse.success(res, inquiry, "Inquiry updated");
  }),
);

module.exports = router;
