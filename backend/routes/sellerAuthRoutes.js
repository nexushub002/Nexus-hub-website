import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

import { verifySeller } from "../middleware/sellerAuth.js";

import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "Seller auth route working" });
});

// ✅ Register
router.post("/seller-register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!phone && !email) {
      return res.status(400).json({ message: "Phone or Email is required" });
    }

    let existingUser = await User.findOne({
      $or: [{ phone }, { email }],
    });

    if (existingUser) {
      // 2. If user exists, check if already seller
      if (existingUser.roles.includes("seller")) {
        return res.status(400).json({ message: "Already registered as seller" });
      }
       // 2. Add missing fields if empty
      if (!existingUser.name && name) existingUser.name = name;
      if (!existingUser.email && email) existingUser.email = email;
      if (!existingUser.phone && phone) existingUser.phone = phone;


      // 3. Add seller role
      existingUser.roles.push("seller");

      // Hash password if provided (optional: only if not set earlier)
      if (password) {
        existingUser.password = await bcrypt.hash(password, 10);
      }

      await existingUser.save();

      // Generate JWT
      const token = jwt.sign(
        { id: existingUser._id, roles: existingUser.roles },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        message: "Seller role added successfully",
        user: existingUser,
        token,
      });
    }

    // 4. If new user → create with buyer + seller role
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      phone,
      email,
      password: hashedPassword,
      roles: ["buyer", "seller"],
    });

    await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      { id: newUser._id, roles: newUser.roles },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Account created as seller",
      user: newUser,
      token,
    });
  } catch (error) {
    console.log(process.env.JWT_SECRET);
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
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
    const token = jwt.sign(
      { id: user._id, role: user.role },
       process.env.JWT_SECRET,
       { expiresIn: "7d" }
    );



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

router.post("/seller-logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});


// ----------------------
// GET PROFILE
// ----------------------
router.get("/me", verifySeller, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user info" });
  }
});



router.post("/become-seller", async (req, res) => {
  try {
    const { companyName, contactPerson, phone, factoryAddress } = req.body;

    // Current logged-in user
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Already a seller?
    if (user.role === "seller") {
      return res.status(400).json({ success: false, message: "You are already a seller" });
    }

    // Update user role
    user.role = "seller";

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