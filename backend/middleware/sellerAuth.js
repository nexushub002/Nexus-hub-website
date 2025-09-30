// middleware/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

export const verifySeller = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ 
        message: "Access denied. No token provided.",
        code: "NO_TOKEN"
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ 
        message: "Invalid or expired token.",
        code: "INVALID_TOKEN"
      });
    }

    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        message: "Invalid token. User not found.",
        code: "USER_NOT_FOUND"
      });
    }

    if (!user.roles.includes("seller")) {
      return res.status(403).json({ 
        message: "Access denied. Seller role required.",
        code: "INSUFFICIENT_PERMISSIONS"
      });
    }

    // Additional security checks
    if (user.isBlocked || user.status === 'suspended') {
      return res.status(403).json({ 
        message: "Account has been suspended. Contact support.",
        code: "ACCOUNT_SUSPENDED"
      });
    }

    // Update last activity
    user.lastActivity = new Date();
    await user.save();

    req.user = user;
    next();
  } catch (error) {
    console.error("Seller auth error:", error);
    res.status(401).json({ 
      message: "Authentication failed.",
      code: "AUTH_ERROR"
    });
  }
};

// Additional middleware for session validation
export const validateSellerSession = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.body.sessionId;
    
    if (sessionId && req.user) {
      // Log session activity for security monitoring
      console.log(`Seller ${req.user._id} session activity: ${sessionId}`);
    }
    
    next();
  } catch (error) {
    console.error("Session validation error:", error);
    next(); // Don't block the request for session validation errors
  }
};
