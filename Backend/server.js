const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
const { errorHandler } = require("./middlewares/errorhandler");
const { generalLimiter } = require("./middlewares/ratelimiter");

const { allowAdminOrMaster } = require("./middlewares/masterAdminMiddleware");

dotenv.config();
connectDB();

const app = express();

// ── Stripe webhook needs raw body ─────────────────────────────────────────────
app.use(
  "/api/payment/webhook/stripe",
  express.raw({ type: "application/json" }),
);

// ── Security & utility middleware ─────────────────────────────────────────────
app.use(helmet());

// ── CORS Configuration ────────────────────────────────────────────────────────
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173", // Vite dev server
      "http://localhost:3000", // Alternative dev port
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
      "https://dcc-frontend-ce9z.onrender.com", // Production frontend on Render
      "https://dcc-frontend-production.vercel.app", // Alternative Vercel deployment
    ];

    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-master-admin-secret"],
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/member", require("./routes/member.routes"));
app.use("/api/businesses", require("./routes/business.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/discounts", require("./routes/discount.routes"));
app.use("/api/offers", require("./routes/offer.routes"));
app.use("/api/membership", require("./routes/membership.routes"));
app.use("/api/certificates", require("./routes/certificate.routes"));
app.use("/api/transactions", require("./routes/transaction.routes"));
app.use("/api/travel", require("./routes/travel.routes"));
app.use("/api/contact", require("./routes/contact.routes"));
app.use("/api/payments", require("./routes/payment.routes"));
app.use("/api/employer", require("./routes/employer.routes"));
app.use("/api/association", require("./routes/association.routes"));
app.use("/api/advertisements", require("./routes/advertisement.routes"));
app.use("/api/analytics", require("./routes/analytics.routes"));
app.use("/api/b2b", require("./routes/b2b.routes"));
app.use("/api/upload", require("./routes/upload.routes"));
app.use("/api/admin", allowAdminOrMaster, require("./routes/admin.routes"));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Discount Club Cayman API is running",
    version: "1.0.0",
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

function startServer(retries = 5) {
  const server = app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
    );
    try {
      const { startJobs } = require("./jobs/membershipExpiry.job");
      startJobs();
      console.log("✅ Cron jobs started");
    } catch (e) {
      console.error("Failed to start cron jobs:", e.message);
    }
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      if (retries > 0) {
        console.warn(
          `⚠️  Port ${PORT} busy — retrying in 1.5s (${retries} attempts left)...`,
        );
        setTimeout(() => startServer(retries - 1), 1500);
      } else {
        console.error(`❌ Port ${PORT} still in use after retries. Exiting.`);
        process.exit(1);
      }
    } else {
      throw err;
    }
  });

  // Graceful shutdown — releases the port so nodemon can restart cleanly
  const shutdown = () => server.close(() => process.exit(0));
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
  // nodemon on Windows uses SIGUSR2 for restart
  process.once("SIGUSR2", () =>
    server.close(() => process.kill(process.pid, "SIGUSR2")),
  );
}

startServer();
