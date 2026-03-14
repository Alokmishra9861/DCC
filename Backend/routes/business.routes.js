const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/business.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");
const { upload } = require("../middlewares/upload.middleware");

// Public
router.get("/", ctrl.listBusinesses);
router.get("/:id", ctrl.getBusinessProfile);

// Business-authenticated routes
router.get("/me/profile", protect, authorize("BUSINESS"), ctrl.getMyBusiness);
router.put("/me/profile", protect, authorize("BUSINESS"), ctrl.updateBusiness);
router.post("/me/logo", protect, authorize("BUSINESS"), upload.single("logo"), ctrl.uploadLogo);
router.post("/me/images", protect, authorize("BUSINESS"), upload.array("images", 5), ctrl.uploadImages);
router.post("/me/payment", protect, authorize("BUSINESS"), ctrl.connectPaymentProcessor);

module.exports = router;
