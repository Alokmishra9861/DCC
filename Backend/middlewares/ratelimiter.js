const rateLimit = require("express-rate-limit");

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  skip: () =>
    process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test",
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skip: () =>
    process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test",
  message: {
    success: false,
    message: "Too many auth attempts, please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: {
    success: false,
    message: "Upload limit reached. Try again in an hour.",
  },
});

module.exports = { generalLimiter, authLimiter, uploadLimiter };
