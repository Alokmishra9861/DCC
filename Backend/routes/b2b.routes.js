// Backend/routes/b2b.routes.js
// Mount in app.js: app.use("/api/b2b", require("./routes/b2b.routes"))

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth.middleware");
const {
  getProfile,
  updateProfile,
  getStats,
  getEnquiries,
  getDirectory,
  submitEnquiry,
} = require("../controllers/b2b.controller");

// ── PUBLIC ────────────────────────────────────────────────────────────────────
// GET /api/b2b/directory — all approved B2B partners (public, no auth needed)
router.get("/directory", getDirectory);

// ── AUTHENTICATED (B2B role only) ─────────────────────────────────────────────
router.get("/profile", protect, authorize("B2B"), getProfile);
router.put("/profile", protect, authorize("B2B"), updateProfile);
router.get("/stats", protect, authorize("B2B"), getStats);
router.get("/enquiries", protect, authorize("B2B"), getEnquiries);

// ── AUTHENTICATED (members, employers, associations, businesses can send enquiries) ────────
// POST /api/b2b/enquire/:partnerId
router.post(
  "/enquire/:partnerId",
  protect,
  authorize("MEMBER", "EMPLOYER", "ASSOCIATION", "BUSINESS"),
  submitEnquiry,
);

module.exports = router;
