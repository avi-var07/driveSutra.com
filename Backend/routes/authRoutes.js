import express from "express";
import { sendOtp, verifyOtp, register, login } from "../controllers/authController.js";

const router = express.Router();

// Route for sending OTP
router.post("/send-otp", sendOtp);

// Route for verifying OTP
router.post("/verify-otp", verifyOtp);

// Route for registering user
router.post("/register", register);

// Route for logging in
router.post("/login", login);

export default router;
