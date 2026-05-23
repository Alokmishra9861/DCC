const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/member.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

router.use(protect);

// Accessible by any authenticated user (e.g., admin, employer, association, or member)
router.get("/profile/:id", ctrl.getMemberProfileById);

router.use(authorize("MEMBER"));

router.get("/profile", ctrl.getProfile);
router.put("/profile", ctrl.updateProfile);
router.get("/qr", ctrl.getMyQR);
router.get("/savings", ctrl.getSavingsDashboard);
router.get("/transactions", ctrl.getTransactionHistory);

module.exports = router;
