// Backend/routes/employer.routes.js

const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/employer.controller");
const { protect } = require("../middlewares/auth.middleware");
const { employerGuard } = require("../middlewares/employerGuard");

// ── Public (no auth) ──────────────────────────────────────────────────────────
// Employee clicks invite link in their email → sets password → activates account
router.post("/employees/accept-invite/:token", ctrl.acceptInvite);

// ── Protected (must be logged-in employer) ────────────────────────────────────
router.use(protect);
router.use(employerGuard);

router.get("/profile", ctrl.getProfile);
router.post("/bulk-purchase", ctrl.bulkPurchase);
router.get("/dashboard", ctrl.getDashboard);
router.get("/employees", ctrl.getEmployees);
router.post("/employees", ctrl.addEmployee);
router.post("/employees/bulk", ctrl.bulkAddEmployees);
router.post("/employees/:id/resend-invite", ctrl.resendInvite);
router.delete("/employees/:id", ctrl.removeEmployee);

module.exports = router;
