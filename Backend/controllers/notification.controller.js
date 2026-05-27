const { prisma } = require("../config/database");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const notificationService = require("../services/notification.service");

/**
 * GET /api/notifications
 * Retrieve paginated notifications for the logged-in user
 */
exports.getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const userId = req.user.id;

  const where = { userId };

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where }),
  ]);

  return ApiResponse.success(res, {
    notifications,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications for the user
 */
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  return ApiResponse.success(res, { count });
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read
 */
exports.markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw ApiError.notFound("Notification not found");
  }

  if (notification.userId !== userId) {
    throw ApiError.forbidden("You do not have permission to modify this notification");
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return ApiResponse.success(res, updated, "Notification marked as read");
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications for the user as read
 */
exports.markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: { isRead: true },
  });

  return ApiResponse.success(res, { count: result.count }, "All notifications marked as read");
});

/**
 * GET /api/notifications/stream
 * Server-Sent Events (SSE) endpoint for true real-time notification streaming
 */
exports.streamNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // 1. Establish SSE Connection headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Bypass Nginx proxy buffering on VPS servers
  res.flushHeaders();

  // Send initial handshake success data
  res.write(`data: ${JSON.stringify({ connected: true, userId })}\n\n`);
  if (typeof res.flush === "function") {
    res.flush();
  }

  // Send an ongoing keep-alive comment pin (ping) every 15 seconds to prevent connection drops by proxies/firewalls
  const keepAlive = setInterval(() => {
    try {
      res.write(":\n\n");
      if (typeof res.flush === "function") {
        res.flush();
      }
    } catch (e) {
      clearInterval(keepAlive);
    }
  }, 15000);

  // 2. Add connection to notification service broadcast pool
  notificationService.addStream(userId, res);

  // Clean up timer on disconnect
  res.on("close", () => {
    clearInterval(keepAlive);
  });
});

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification by ID
 */
exports.deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw ApiError.notFound("Notification not found");
  }

  if (notification.userId !== userId) {
    throw ApiError.forbidden("You do not have permission to delete this notification");
  }

  await prisma.notification.delete({
    where: { id },
  });

  return ApiResponse.success(res, {}, "Notification deleted successfully");
});

/**
 * DELETE /api/notifications
 * Clear/delete all notifications for the logged-in user
 */
exports.clearAllNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await prisma.notification.deleteMany({
    where: { userId },
  });

  return ApiResponse.success(res, {}, "All notifications cleared successfully");
});
