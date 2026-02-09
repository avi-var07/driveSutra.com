import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false,
        message: "No token provided, authorization denied" 
      });
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Token not found" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    req.user = user; // attach full user object
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false,
        message: "Token expired" 
      });
    }
    
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token" 
      });
    }
    
    return res.status(401).json({ 
      success: false,
      message: "Authentication failed" 
    });
  }
};

// Optional authentication - attaches user if token is present, but doesn't fail if not
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No token provided, continue without user
      return next();
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      // No token, continue without user
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (user) {
      req.user = user; // attach full user object if found
      console.log('[OPTIONAL AUTH] User authenticated:', user._id);
    } else {
      console.log('[OPTIONAL AUTH] User not found for token');
    }
    
    next();
  } catch (err) {
    console.error("[OPTIONAL AUTH] Error:", err.message);
    // Don't fail on error, just continue without user
    next();
  }
};

export default protect;

// Admin authentication middleware
export const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false,
        message: "No token provided, authorization denied" 
      });
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Token not found" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Admin only." 
      });
    }

    // Import Admin model dynamically to avoid circular dependency
    const { default: Admin } = await import('../models/Admin.js');
    
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: "Admin not found" 
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({ 
        success: false,
        message: "Admin account is deactivated" 
      });
    }

    req.admin = admin; // attach full admin object
    next();
  } catch (err) {
    console.error("Admin auth error:", err.message);
    
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false,
        message: "Token expired" 
      });
    }
    
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token" 
      });
    }
    
    return res.status(401).json({ 
      success: false,
      message: "Authentication failed" 
    });
  }
};
