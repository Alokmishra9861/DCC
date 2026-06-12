const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const {
  upload,
  uploadDoc,
  uploadToCloudinary,
} = require("../middlewares/upload.middleware");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");

// Generic single file upload (profile avatar etc.)
router.post(
  "/image",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest("No file uploaded");
    const resourceType = req.file.mimetype && req.file.mimetype.startsWith("video/") ? "video" : "image";
    const result = await uploadToCloudinary(req.file.buffer, "general", resourceType);
    return ApiResponse.success(
      res,
      { url: result.secure_url },
      "File uploaded",
    );
  }),
);

// Generic single document upload (PDF, DOC, DOCX)
router.post(
  "/document",
  uploadDoc.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest("No file uploaded");
    // Use raw for documents so Cloudinary retains doc/pdf format
    const result = await uploadToCloudinary(req.file.buffer, "documents", "raw");
    return ApiResponse.success(
      res,
      { url: result.secure_url },
      "Document uploaded",
    );
  }),
);

module.exports = router;
