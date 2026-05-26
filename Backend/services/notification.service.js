const { prisma } = require("../config/database");

// Map of active SSE streams: userId -> Set of Express Response objects
const activeStreams = new Map();

/**
 * Add a new SSE stream connection for a user
 * @param {string} userId - The ID of the authenticated user
 * @param {object} res - Express Response object
 */
const addStream = (userId, res) => {
  if (!activeStreams.has(userId)) {
    activeStreams.set(userId, new Set());
  }
  activeStreams.get(userId).add(res);

  // Clean up on client disconnect
  res.on("close", () => {
    removeStream(userId, res);
  });
};

/**
 * Remove an SSE stream connection for a user
 * @param {string} userId - The ID of the user
 * @param {object} res - Express Response object
 */
const removeStream = (userId, res) => {
  const userSet = activeStreams.get(userId);
  if (userSet) {
    userSet.delete(res);
    if (userSet.size === 0) {
      activeStreams.delete(userId);
    }
  }
};

/**
 * Create a new notification in the database and push it in real-time if the user is connected
 * @param {string} userId - The ID of the target user
 * @param {string} title - The notification title
 * @param {string} message - The notification message content
 * @param {string} type - Notification type: "INFO" | "BOOKING" | "PAYOUT" | "SYSTEM"
 * @returns {Promise<object>} The created notification record
 */
const createNotification = async (userId, title, message, type = "INFO") => {
  try {
    // 1. Save to Database
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        isRead: false,
      },
    });

    // 2. Broadcast Live to User Streams (SSE)
    const userSet = activeStreams.get(userId);
    if (userSet && userSet.size > 0) {
      const payload = `data: ${JSON.stringify(notification)}\n\n`;
      for (const res of userSet) {
        try {
          res.write(payload);
        } catch (err) {
          console.error(`Failed to push notification to user ${userId}:`, err.message);
        }
      }
    }

    return notification;
  } catch (err) {
    console.error("Error in createNotification:", err.message);
    throw err;
  }
};

module.exports = {
  addStream,
  removeStream,
  createNotification,
};
