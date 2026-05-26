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
            <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Outfit', 'Helvetica Neue', Helvetica, Arial, sans-serif; min-height: 100%;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px -10px rgba(28, 77, 141, 0.08); border: 1px solid #e2e8f0;">
                
                <!-- Top Decorative Header with Logo -->
                <div style="background: linear-gradient(135deg, #1C4D8D 0%, #0F2854 100%); padding: 35px 40px; text-align: center; position: relative;">
                  <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 10px 18px; margin-bottom: 12px; border: 1px solid rgba(255, 255, 255, 0.15); backdrop-blur: 8px;">
                    <span style="font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase;">Discount Club Cayman</span>
                  </div>
                  <p style="margin: 0; font-size: 13px; color: #D4A62A; text-transform: uppercase; letter-spacing: 2px; font-weight: 800;">PLATFORM ALERT NOTIFICATION</p>
                </div>

                <!-- Main Message Card -->
                <div style="padding: 40px 45px; background-color: #ffffff;">
                  <!-- Bell Icon Badge Header -->
                  <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 24px; background-color: #f1f5f9; border-radius: 12px; padding: 8px 16px;">
                    <span style="font-size: 16px; display: inline-block; transform: scaleX(-1);">🔔</span>
                    <span style="font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Live Activity Alert</span>
                  </div>

                  <!-- Notification Title -->
                  <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 22px; font-weight: 800; line-height: 1.3;">
                    \${title}
                  </h2>

                  <!-- Notification Content -->
                  <p style="margin: 0 0 32px 0; font-size: 15px; color: #475569; line-height: 1.7; font-weight: 500;">
                    \${message}
                  </p>

                  <!-- Action Button Group -->
                  <div style="text-align: center; margin-bottom: 20px;">
                    <a href="${process.env.CLIENT_URL || 'https://discountclubcayman.com'}" style="background-color: #1C4D8D; color: #ffffff; padding: 16px 36px; border-radius: 14px; text-decoration: none; display: inline-block; font-weight: 800; font-size: 15px; box-shadow: 0 8px 20px -6px rgba(28, 77, 141, 0.35);">
                      Open Dashboard
                    </a>
                  </div>
                </div>

                <!-- Decorative Footer Block -->
                <div style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 30px 40px; text-align: center;">
                  <p style="margin: 0 0 10px 0; font-size: 11px; color: #94a3b8; line-height: 1.6; font-weight: 500;">
                    This is an automated system notification from Discount Club Cayman. You are receiving this email because you hold an active account linked to this email address.
                  </p>
                  <div style="margin-top: 20px; font-size: 11px; color: #64748b; font-weight: 700;">
                    © 2026 Discount Club Cayman. All Rights Reserved.
                  </div>
                </div>
                
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
