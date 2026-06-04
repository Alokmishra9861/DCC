const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/transaction.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

router.post("/scan", protect, authorize("BUSINESS"), ctrl.recordTransaction);
router.post(
  "/scan-details",
  protect,
  authorize("BUSINESS"),
  ctrl.getScanDetails,
);
router.get(
  "/business",
  protect,
  authorize("BUSINESS"),
  ctrl.getBusinessTransactions,
);
// ISSUE 10: Member transaction history
router.get("/my", protect, authorize("MEMBER"), ctrl.getMemberTransactions);
// ISSUE 7: Admin cancel transaction with stat reversal
router.patch("/:id/cancel", protect, authorize("ADMIN"), ctrl.cancelTransaction);

module.exports = router;

