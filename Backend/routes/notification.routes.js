const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/notification.controller");
const { protect } = require("../middlewares/auth.middleware");

// All routes require user authentication
router.get("/", protect, ctrl.getNotifications);
router.get("/unread-count", protect, ctrl.getUnreadCount);
router.patch("/read-all", protect, ctrl.markAllAsRead);
router.patch("/:id/read", protect, ctrl.markAsRead);
router.delete("/:id", protect, ctrl.deleteNotification);
router.delete("/", protect, ctrl.clearAllNotifications);

// Server-Sent Events (SSE) real-time stream endpoint
router.get("/stream", protect, ctrl.streamNotifications);

module.exports = router;
