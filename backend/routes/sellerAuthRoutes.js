import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
require("dotenv").config();

const router = express.Router();

// ✅ Register
router.post("/seller-register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists then to show signin option in fronted and disble signup
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    if(!user.roles.includes('Manufacturer')) user.roles.push('Manufacturer');

    await user.save();

    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Login
router.post("/seller-login", async (req, res) => {
  try {
    const { email, password } = req.body;

     // 1. Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });
    
    // 2. Check password (assuming bcrypt)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });
    
    // 3. Sign JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    

    // 4. Set JWT in secure cookie
  res.cookie("token", token, {
    httpOnly: true,       // ❌ not accessible by JS
    secure: process.env.NODE_ENV === "production", // ✅ only https in prod
    sameSite: "strict",   // ✅ CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });


    res.json({ success: true, token, role: user.role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});



router.post("/become-seller", async (req, res) => {
  try {
    const { companyName, contactPerson, phone, factoryAddress } = req.body;

    // Current logged-in user
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Already a seller?
    if (user.role === "manufacturer") {
      return res.status(400).json({ success: false, message: "You are already a seller" });
    }

    // Update user role
    user.role = "manufacturer";

    // Create manufacturer profile
    const manufacturer = await Manufacturer.create({
      companyName,
      contactPerson,
      phone,
      factoryAddress,
      user: user._id,
    });

    // Link manufacturer to user
    user.manufacturerProfile = manufacturer._id;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Upgraded to seller successfully", 
      user, 
      manufacturer 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;