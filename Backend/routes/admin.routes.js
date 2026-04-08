// Backend/routes/admin.routes.js
// Mount in app.js: app.use("/api/admin", require("./routes/admin.routes"))

const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/admin.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

// All admin routes require ADMIN role
router.use(protect, authorize("ADMIN"));

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get("/stats", ctrl.getDashboardStats);

// ── Users ─────────────────────────────────────────────────────────────────────
router.get("/users", ctrl.getAllUsers);
router.put("/users/:id/role", ctrl.updateUserRole);
router.put("/users/:id/status", ctrl.toggleUserStatus);
router.delete("/users/:id", ctrl.deleteUser);

// ── Members ───────────────────────────────────────────────────────────────────
router.get("/members", ctrl.getAdminMembers);
router.patch("/members/:id", ctrl.updateMember);
router.delete("/members/:id", ctrl.deleteMember);

// ── Pending approvals (all types in one call) ─────────────────────────────────
router.get("/pending", ctrl.getPendingApprovals);

// ── Memberships ───────────────────────────────────────────────────────────────
router.get("/memberships", ctrl.getAllMemberships);
router.get("/memberships/pending", ctrl.getPendingMemberships);
router.patch("/memberships/:id/approve", ctrl.approveMembership);

// ── Employers ─────────────────────────────────────────────────────────────────
router.get("/employers", ctrl.getAllEmployers);
router.patch("/employers/:id/approve", ctrl.approveEmployer);
router.patch("/employers/:id/reject", ctrl.rejectEmployer);

// ── Associations ──────────────────────────────────────────────────────────────
router.get("/associations", ctrl.getAllAssociations);
router.patch("/associations/:id/approve", ctrl.approveAssociation);

// ── Businesses ────────────────────────────────────────────────────────────────
router.get("/businesses", ctrl.getAdminBusinesses);
router.patch("/businesses/:id", ctrl.updateBusiness);
router.patch("/businesses/:id/approve", ctrl.approveBusiness);
router.patch("/businesses/:id/reject", ctrl.rejectBusiness);

// ── B2B Partners ──────────────────────────────────────────────────────────────
// GET  /api/admin/b2b             → list all B2B partners (filter: ?status=pending|approved)
// PATCH /api/admin/b2b/:id/approve → set isApproved: true → partner appears in /b2b-directory
// PATCH /api/admin/b2b/:id/reject  → keep isApproved: false
router.get("/b2b", ctrl.getB2BPartners);
router.patch("/b2b/:id/approve", ctrl.approveB2BPartner);
router.patch("/b2b/:id/reject", ctrl.rejectB2BPartner);

// ── Contact inquiries ─────────────────────────────────────────────────────────
router.get("/inquiries", ctrl.getInquiries);
router.put("/inquiries/:id/status", ctrl.updateInquiryStatus);

// ── Audit log ─────────────────────────────────────────────────────────────────
router.get("/audit", ctrl.getAuditLog);

module.exports = router;
