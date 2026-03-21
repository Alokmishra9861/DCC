// Backend/routes/association.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/association.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

// ── Public routes (no auth) ───────────────────────────────────────────────────
// Member invite accept (email link)
router.post("/members/accept-invite/:token", ctrl.acceptMemberInvite);
// Business invite accept (email link)
router.post("/businesses/accept-invite/:token", ctrl.acceptBusinessInvite);

// ── Member self-join via code (requires MEMBER auth) ─────────────────────────
router.post("/join", protect, authorize("MEMBER"), ctrl.joinByCode);

// ── All routes below require ASSOCIATION role ─────────────────────────────────
router.use(protect);
router.use(authorize("ASSOCIATION"));

// Profile
router.get("/profile", ctrl.getProfile);

// Dashboard
router.get("/dashboard", ctrl.getDashboard);

// Join code (MEMBER-type only)
router.post("/join-code/generate", ctrl.generateJoinCode);
router.patch("/join-code/toggle", ctrl.toggleJoinCode);

// ── MEMBER-type association routes ────────────────────────────────────────────
// Members
router.get("/members", ctrl.getMembers);
router.post("/members", ctrl.addMember);
router.post("/members/bulk", ctrl.bulkAddMembers);
router.post("/members/:id/resend-invite", ctrl.resendMemberInvite);
router.delete("/members/:id", ctrl.removeMember);

// ── BUSINESS-type association routes ──────────────────────────────────────────
// Businesses
router.get("/businesses", ctrl.getLinkedBusinesses);
router.get("/businesses/:id/detail", ctrl.getLinkedBusinessDetail);
router.post("/businesses/link", ctrl.linkBusiness);
router.post("/businesses/invite", ctrl.inviteBusiness);
router.delete("/businesses/:id", ctrl.removeBusiness);

module.exports = router;
