const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const {
  upload,
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

module.exports = router;
