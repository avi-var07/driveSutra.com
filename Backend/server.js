import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
import rewardRoutes from "./routes/rewardRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import treePlantingRoutes from "./routes/treePlantingRoutes.js";
import publicTransportRoutes from "./routes/publicTransportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import partnerRoutes from "./routes/partnerRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";

import { initializeAchievements } from "./controllers/achievementController.js";
import { initializeChallenges } from "./utils/initializeChallenges.js";
import { initializeRewards } from "./controllers/rewardController.js";

dotenv.config();

const app = express();

/* ---------- CORS (FIXED PROPERLY) ---------- */
const allowedOrigins = [
  // "http://localhost:5173",
  // "http://localhost:3000",
  "https://drivesutrago.vercel.app",
  // "https://drivesutra.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("CORS Origin:", origin);

    // Allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

/* ---------- DEBUG LOGGER ---------- */
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Origin:", req.headers.origin);
  next();
});

/* ---------- BODY PARSERS ---------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ---------- ROUTES ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/users", userRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/trees", treePlantingRoutes);
app.use("/api/public-transport", publicTransportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/donations", donationRoutes);

/* ---------- HEALTH ---------- */
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

/* ---------- ERROR HANDLER ---------- */
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS blocked request"
    });
  }

  res.status(500).json({
    success: false,
    message: "Something went wrong!"
  });
});

/* ---------- 404 ---------- */
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

/* ---------- START SERVER ---------- */
const startServer = async () => {
  try {
    await connectDB();

    await initializeAchievements();
    await initializeChallenges();
    await initializeRewards();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 EcoDrive Backend running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();