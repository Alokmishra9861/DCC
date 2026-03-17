const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/admin.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

// All admin routes require ADMIN role
router.use(protect);
router.use(authorize("ADMIN"));

// Dashboard stats
router.get("/stats", ctrl.getDashboardStats);

// Users
router.get("/users", ctrl.getAllUsers);
router.put("/users/:id/status", ctrl.toggleUserStatus);
router.put("/users/:id/role", ctrl.updateUserRole);
router.delete("/users/:id", ctrl.deleteUser);

// Membersa
router.get("/members", ctrl.getAdminMembers);
router.patch("/members/:id", ctrl.updateMember);
router.delete("/members/:id", ctrl.deleteMember);

// Approvals
router.get("/pending", ctrl.getPendingApprovals);
router.patch("/employers/:id/approve", ctrl.approveEmployer);
router.patch("/associations/:id/approve", ctrl.approveAssociation);
router.patch("/businesses/:id/approve", ctrl.approveBusiness);
router.patch("/businesses/:id/reject", ctrl.rejectBusiness);

// Membership approvals
router.get("/memberships/pending", ctrl.getPendingMemberships);
router.patch("/memberships/:id/approve", ctrl.approveMembership);

// Businesses
router.get("/businesses", ctrl.getAdminBusinesses);
router.put("/businesses/:id/approve", ctrl.approveBusiness);
router.patch("/businesses/:id", ctrl.updateBusiness);
router.patch("/businesses/:id/reject", ctrl.rejectBusiness);

// Contact inquiries
router.get("/inquiries", ctrl.getInquiries);
router.put("/inquiries/:id/status", ctrl.updateInquiryStatus);

// Audit log
router.get("/audit", ctrl.getAuditLog);

module.exports = router;
