// ═══════════════════════════════════════════
// auth.routes.js
// ═══════════════════════════════════════════
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authLimiter } = require("../middlewares/ratelimiter");

router.post("/register", authLimiter, ctrl.register);
router.post("/login", authLimiter, ctrl.login);
router.get("/verify/:token", ctrl.verifyEmail);
router.post("/forgot-password", authLimiter, ctrl.forgotPassword);
router.post("/reset-password", ctrl.resetPassword);
router.post("/refresh-token", ctrl.refreshToken);
router.get("/me", protect, ctrl.getMe);

module.exports = router;
