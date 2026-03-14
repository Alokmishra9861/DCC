const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/analytics.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

router.use(protect);
router.use(authorize("ADMIN"));

router.get("/overview", ctrl.getPlatformOverview);
router.get("/by-category", ctrl.getSavingsByCategory);
router.get("/by-district", ctrl.getSavingsByDistrict);
router.get("/by-demographics", ctrl.getSavingsByDemographics);
router.get("/membership", ctrl.getMembershipAnalytics);
router.get("/time-series", ctrl.getTimeSeries);
router.get("/export", ctrl.exportReport);

module.exports = router;
