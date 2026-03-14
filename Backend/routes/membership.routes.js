const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/membership.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

// ── Public ────────────────────────────────────────────────────────────────────

// GET /api/membership/plans — list available plans (shown on /membership page)
router.get("/plans", ctrl.getPlans);

// ── Member ────────────────────────────────────────────────────────────────────

// GET /api/membership/my — get current user's membership record + status
router.get("/my", protect, authorize("MEMBER"), ctrl.getMyMembership);

// POST /api/membership/subscribe — activate membership after payment
// Body: { planType, paymentProvider, paymentId }
router.post("/subscribe", protect, authorize("MEMBER"), ctrl.subscribe);

// PUT /api/membership/:id/cancel — cancel membership
router.put("/:id/cancel", protect, authorize("MEMBER"), ctrl.cancelMembership);

module.exports = router;
