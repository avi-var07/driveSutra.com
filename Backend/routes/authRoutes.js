import express from "express";
import { sendOtp, verifyOtp, register, login, logout, forgotPassword, verifyForgotOtp, resetPassword, changePassword, updateProfile, googleSignIn, getUserSessions } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route for sending OTP
router.post("/send-otp", sendOtp);

// Route for verifying OTP
router.post("/verify-otp", verifyOtp);

// Route for registering user
router.post("/register", register);

// Route for logging in
router.post("/login", login);

// Route for logging out
router.post("/logout", logout);

// Google Sign-in route
router.post("/google-signin", googleSignIn);

// Forgot password routes
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-otp", verifyForgotOtp);
router.post("/reset-password", resetPassword);

// Protected routes
router.post("/change-password", protect, changePassword);
router.post("/update-profile", protect, updateProfile);
router.get("/sessions", protect, getUserSessions);

export default router;
