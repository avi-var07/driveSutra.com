import User from "../models/User.js";
import OtpToken from "../models/OtpToken.js";
import otpGenerator from "otp-generator";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import { OAuth2Client } from 'google-auth-library';

// Send OTP
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    // For registration flow: if a user already exists with this email, instruct to login
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Account already exists, please login" });
    }

    const otp = otpGenerator.generate(6, { digits: true, upperCase: false, specialChars: false });
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete existing OTP for this email
    await OtpToken.findOneAndDelete({ email });
    
    // Save new OTP
    await OtpToken.create({ email, code: otp, expiresAt });

    // Send email
    await sendEmail(email, "EcoDrive Email Verification", `<h2>Your OTP: ${otp}</h2><p>Valid for 10 minutes</p>`);

    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const record = await OtpToken.findOne({ email });

    if (!record) {
      return res.status(400).json({ success: false, message: "OTP expired or not found" });
    }

    if (record.code !== otp) {
      return res.status(400).json({ success: false, message: "Incorrect OTP" });
    }

    if (new Date() > record.expiresAt) {
      await OtpToken.deleteOne({ _id: record._id });
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    // Delete OTP after successful verification
    await OtpToken.deleteOne({ _id: record._id });

    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
};

// Forgot password - send OTP to existing user
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Account not found" });

    const otp = otpGenerator.generate(6, { digits: true, upperCase: false, specialChars: false });
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OtpToken.findOneAndDelete({ email, purpose: 'forgot' });
    await OtpToken.create({ email, code: otp, purpose: 'forgot', expiresAt });

    await sendEmail(email, "EcoDrive Password Reset", `<h2>Your password reset OTP: ${otp}</h2><p>Valid for 10 minutes</p>`);

    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// Verify forgot-password OTP and return a short-lived reset token
export const verifyForgotOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP are required" });

    const record = await OtpToken.findOne({ email, purpose: 'forgot' });
    if (!record) return res.status(400).json({ success: false, message: "OTP expired or not found" });
    if (record.code !== otp) return res.status(400).json({ success: false, message: "Incorrect OTP" });
    if (new Date() > record.expiresAt) {
      await OtpToken.deleteOne({ _id: record._id });
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    // Delete OTP after verification
    await OtpToken.deleteOne({ _id: record._id });

    // Create a short-lived JWT as reset token (15 minutes)
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });

    return res.status(200).json({ success: true, message: "OTP verified", resetToken });
  } catch (error) {
    console.error("Verify Forgot OTP Error:", error);
    return res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
};

// Reset password using reset token
export const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !resetToken || !newPassword) return res.status(400).json({ success: false, message: "Missing required fields" });

    // Verify token
    try {
      const payload = jwt.verify(resetToken, process.env.JWT_SECRET);
      if (payload.email !== email) return res.status(400).json({ success: false, message: "Invalid reset token" });
    } catch (err) {
      return res.status(400).json({ success: false, message: "Reset token invalid or expired" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};

// Change password for authenticated user
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Old and new passwords are required" });
    }

    // req.user is provided by protect middleware, but it was selected without password.
    // Fetch full user document to access password and comparePassword method.
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: "Old password is incorrect" });

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({ success: false, message: "Failed to change password" });
  }
};

// Update profile (name, avatar) for authenticated user
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (typeof avatar !== "undefined") user.avatar = avatar;

    await user.save();

    // Return updated user (exclude password)
    const { _id, email, xp, level, ecoScore } = user;
    return res.status(200).json({
      success: true,
      message: "Profile updated",
      user: { _id, firstName: user.firstName, lastName: user.lastName, email, xp, level, ecoScore, avatar: user.avatar }
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

// Register
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Create new user
    const user = await User.create({ firstName, lastName, email, password });

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Return success with user data (exclude password)
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        xp: user.xp,
        level: user.level,
        ecoScore: user.ecoScore,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ success: false, message: "Registration failed" });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // Compare passwords using the method we added
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Wrong password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        xp: user.xp,
        level: user.level,
        ecoScore: user.ecoScore,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

// Google Sign-in
export const googleSignIn = async (req, res) => {
  try {
    const { idToken, profile } = req.body;

    if (!idToken || !profile) {
      return res.status(400).json({ success: false, message: "Missing Google authentication data" });
    }

    // Verify Google ID token
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    try {
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      
      if (!payload || payload.email !== profile.email) {
        return res.status(400).json({ success: false, message: "Invalid Google token" });
      }
    } catch (verifyError) {
      console.error("Google token verification failed:", verifyError);
      return res.status(400).json({ success: false, message: "Invalid Google token" });
    }

    // Check if user exists
    let user = await User.findOne({ email: profile.email });

    if (user) {
      // Update user profile with Google data if needed
      if (!user.avatar && profile.avatar) {
        user.avatar = profile.avatar;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        password: 'google_auth_' + Date.now(), // Placeholder password
        avatar: profile.avatar || '',
        isVerified: true, // Google accounts are pre-verified
        googleId: profile.id
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Google sign-in successful",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        xp: user.xp,
        level: user.level,
        ecoScore: user.ecoScore,
        carbonCredits: user.carbonCredits,
        treesGrown: user.treesGrown,
        co2Saved: user.co2Saved,
        currentStreak: user.currentStreak,
        totalTrips: user.totalTrips
      },
    });
  } catch (error) {
    console.error("Google Sign-in Error:", error);
    return res.status(500).json({ success: false, message: "Google sign-in failed" });
  }
};
