import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "No authentication token found",
        code: "NO_TOKEN"
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "nexushub-secret");
    } catch (jwtError) {
      return res.status(401).json({ 
        success: false,
        message: "Token expired or invalid",
        code: "INVALID_TOKEN"
      });
    }

    const user = await User.findById(decoded.userId || decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND"
      });
    }

    // Check if user has admin role
    if (!user.roles || !user.roles.includes("admin")) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Admin privileges required.",
        code: "INSUFFICIENT_PERMISSIONS"
      });
    }

    req.admin = user;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(401).json({ 
      success: false,
      message: "Authentication failed",
      code: "AUTH_ERROR"
    });
  }
};

