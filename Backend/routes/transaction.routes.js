const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/transaction.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

router.post("/scan", protect, authorize("BUSINESS"), ctrl.recordTransaction);
router.get(
  "/business",
  protect,
  authorize("BUSINESS"),
  ctrl.getBusinessTransactions,
);

module.exports = router;
