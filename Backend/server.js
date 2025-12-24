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

import { initializeAchievements } from "./controllers/achievementController.js";
import { initializeChallenges } from "./utils/initializeChallenges.js";
import { initializeRewards } from "./controllers/rewardController.js";

dotenv.config();

const app = express();

/* ---------- Middlewares ---------- */
// 1. CORS - MUST be first
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://drivesutrago.vercel.app",
    "https://drivesutra.vercel.app",
    "https://drivesutrago-com-backend.onrender.com" // Allow self for testing
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
// Force preflight handling for everything
app.options('*', cors(corsOptions));

// 2. Debug Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  next();
});

// 3. Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ---------- Routes ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/users", userRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/contact", contactRoutes);

/* ---------- Health ---------- */
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

/* ---------- Errors ---------- */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!"
  });
});

/* ---------- 404 ---------- */
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

/* ---------- START SERVER ---------- */
const startServer = async () => {
  try {
    await connectDB();

    await initializeAchievements();
    await initializeChallenges();
    await initializeRewards();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 EcoDrive Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
