// middleware/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

export const verifySeller = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    // Simple check - if no token, redirect to signin
    if (!token) {
      return res.status(401).json({ 
        message: "No authentication token found",
        code: "NO_TOKEN"
      });
    }

    // Verify token and get user
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "nexushub-seller-secret");
    } catch (jwtError) {
      return res.status(401).json({ 
        message: "Token expired or invalid",
        code: "INVALID_TOKEN"
      });
    }

    const user = await User.findById(decoded.userId);
    
    if (!user || !user.roles.includes("seller")) {
      return res.status(401).json({ 
        message: "Invalid seller account",
        code: "INVALID_SELLER"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Seller auth error:", error);
    res.status(401).json({ 
      message: "Authentication failed",
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
