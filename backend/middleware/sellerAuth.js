// middleware/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifySeller = (req, res, next) => {
  try {
    // Check for token in Authorization header first
    let token = req.headers["authorization"]?.split(" ")[1]; // Bearer <token>
    
    // If no token in header, check cookies
    if (!token) {
      token = req.cookies?.token;
    }
    
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user has seller role
    if (!decoded.roles || !decoded.roles.includes("seller")) {
      return res.status(403).json({ message: "Not authorized as seller" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
