const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/analytics.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

const admin = [protect, authorize("ADMIN")];

// ── Open to all authenticated roles ──────────────────────────────────────────
router.get("/role-stats", protect, ctrl.getRoleAnalytics);

// ── Admin-only routes ────────────────────────────────────────────────────────
router.get("/overview", ...admin, ctrl.getPlatformOverview);
router.get("/by-category", ...admin, ctrl.getSavingsByCategory);
router.get("/by-district", ...admin, ctrl.getSavingsByDistrict);
router.get("/by-demographics", ...admin, ctrl.getSavingsByDemographics);
router.get("/membership", ...admin, ctrl.getMembershipAnalytics);
router.get("/time-series", ...admin, ctrl.getTimeSeries);
router.get("/export", ...admin, ctrl.exportReport);

module.exports = router;
