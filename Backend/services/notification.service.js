const { prisma } = require("../config/database");
const { sendEmail } = require("./email.service");

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

    // 3. Dispatch Email Notification (Asynchronous / Non-blocking in the background)
    try {
      prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      }).then(async (userRecord) => {
        if (userRecord?.email) {
          const subject = title;
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
              <div style="background-color: #1C4D8D; padding: 24px; border-radius: 12px 12px 0 0; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Discount Club Cayman</h1>
                <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Platform Alert Notification</p>
              </div>
              <div style="padding: 24px; color: #334155; line-height: 1.6;">
                <h2 style="margin-top: 0; color: #1e293b; font-size: 18px; font-weight: 700;">${title}</h2>
                <p style="font-size: 15px; margin-bottom: 24px;">${message}</p>
                <a href="${process.env.CLIENT_URL || 'https://discountclubcayman.com'}" style="background-color: #1C4D8D; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: bold; font-size: 14px;">
                  Open Dashboard
                </a>
              </div>
              <div style="border-top: 1px solid #e5e7eb; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
                <p style="margin: 0;">This is an automated system notification. You are receiving this because you registered an account with Discount Club Cayman.</p>
              </div>
            </div>
          `;
          await sendEmail({ to: userRecord.email, subject, html });
        }
      }).catch(err => {
        console.error("Error in background notification email sender:", err.message);
      });
    } catch (emailErr) {
      console.error("Failed to trigger background notification email:", emailErr.message);
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
