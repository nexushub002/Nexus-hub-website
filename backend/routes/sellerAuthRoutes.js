import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Seller from "../models/SellerProfile.js";
import { verifySeller } from "../middleware/sellerAuth.js";

const router = express.Router();

// ----------------------
// SELLER REGISTRATION
// ----------------------
router.post("/seller-register", async (req, res) => {
  try {
    console.log("📝 Registration data received:", JSON.stringify(req.body, null, 2));

    const {
      name,
      email,
      phone,
      password,
      // Manufacturer Information
      companyName,
      yearOfEstablishment,
      numberOfEmployees,
      companyAddress,
      factoryAddress,
      contactPerson,
      gstin,
      cin,
      pan,
      aboutCompany,
      website,
      yearsInBusiness
    } = req.body;

    // Validation
    if (!name || !email || !phone || !password || !companyName || !companyAddress) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone, password, company name, and company address are required"
      });
    }

    if (!contactPerson || !contactPerson.name || !contactPerson.phone || !contactPerson.email) {
      return res.status(400).json({
        success: false,
        message: "Contact person name, phone, and email are required"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or phone already exists"
      });
    }

    // Check if seller already exists
    const existingSeller = await Seller.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: "Seller with this email or phone already exists"
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate unique seller ID
    const generateSellerId = () => {
      const prefix = "NXS";
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `${prefix}${timestamp}${random}`;
    };

    let sellerId = generateSellerId();
    // Ensure sellerId is unique
    while (await User.findOne({ sellerId })) {
      sellerId = generateSellerId();
    }

    // Create new seller user
    const newUser = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: hashedPassword,
      sellerId: sellerId, // Add unique seller ID
      businessName: companyName.trim(), // Use companyName as businessName for backward compatibility
      gstNumber: gstin ? gstin.trim() : "",
      roles: ["seller"], // Set seller role
      isVerified: true, // Auto-verify for now
      products: [], // Initialize empty products array
      createdAt: new Date()
    });

    await newUser.save();

    // Create comprehensive seller profile using the same sellerId
    const newSeller = new Seller({
      sellerId,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      password: hashedPassword,
      companyName: companyName.trim(),
      yearOfEstablishment: yearOfEstablishment || undefined,
      numberOfEmployees: numberOfEmployees || undefined,
      companyAddress: companyAddress.trim(),
      factoryAddress: factoryAddress ? factoryAddress.trim() : undefined,
      contactPerson: {
        name: contactPerson.name.trim(),
        designation: contactPerson.designation ? contactPerson.designation.trim() : undefined,
        phone: contactPerson.phone.trim(),
        email: contactPerson.email.trim()
      },
      gstNumber: gstin ? gstin.trim() : "",
      cin: cin ? cin.trim() : undefined,
      pan: pan ? pan.trim() : undefined,
      aboutCompany: aboutCompany ? aboutCompany.trim() : undefined,
      website: website ? website.trim() : undefined,
      yearsInBusiness: yearsInBusiness || undefined,
      verified: false,
      products: [] // Initialize empty products array
    });

    await newSeller.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
        roles: newUser.roles
      },
      process.env.JWT_SECRET || "nexushub-seller-secret",
      { expiresIn: "30d" }
    );

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // <-- SET TO true
      sameSite: "none", // <-- FIX
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Return user data with seller profile (without password)
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      sellerId: newUser.sellerId, // Include seller ID
      businessName: newUser.businessName,
      gstNumber: newUser.gstNumber,
      roles: newUser.roles,
      sellerProfile: newSeller,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      success: true,
      message: "Seller account and seller profile created successfully",
      user: userResponse
    });

  } catch (error) {
    console.error("Seller registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration"
    });
  }
});

// ----------------------
// SELLER LOGIN
// ----------------------
router.post("/seller-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user by email
    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check if user has seller role
    if (!user.roles || !user.roles.includes("seller")) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Seller account required."
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        roles: user.roles
      },
      process.env.JWT_SECRET || "nexushub-seller-secret",
      { expiresIn: "30d" }
    );

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // <-- SET TO true
      sameSite: "none", // <-- FIX
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Return user data (without password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      sellerId: user.sellerId, // Include seller ID
      businessName: user.businessName,
      gstNumber: user.gstNumber,
      roles: user.roles
    };

    res.json({
      success: true,
      message: "Login successful",
      user: userResponse
    });

  } catch (error) {
    console.error("Seller login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
});

// ----------------------
// SELLER LOGOUT
// ----------------------
router.post("/seller-logout", async (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.json({
      success: true,
      message: "Logout successful"
    });

  } catch (error) {
    console.error("Seller logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout"
    });
  }
});

// ----------------------
// GET PROFILE
// ----------------------
router.get("/me", verifySeller, async (req, res) => {
  try {
    // verifySeller populates req.user
    return res.json({ user: req.user });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching user info" });
  }
});

// ----------------------
// UPDATE PROFILE
// ----------------------
router.put("/profile", verifySeller, async (req, res) => {
  try {
    const { name, phone, businessName, gstNumber, companyAddress } = req.body || {};

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (typeof name === "string") user.name = name;
    if (typeof phone === "string") user.phone = phone;
    if (typeof businessName === "string") user.businessName = businessName;
    if (typeof gstNumber === "string") user.gstNumber = gstNumber;
    if (companyAddress && typeof companyAddress === "object") {
      user.companyAddress = { ...(user.companyAddress || {}), ...companyAddress };
    }

    await user.save();
    return res.json({ success: true, message: "Profile updated", user });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;