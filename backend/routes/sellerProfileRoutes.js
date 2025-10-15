import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Seller from "../models/SellerProfile.js";
import Product from "../models/Product.js";

const router = express.Router();

// Generate unique seller ID
const generateSellerId = () => {
  const prefix = "NXS";
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

// Middleware to verify seller token
const verifySeller = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "nexushub-seller-secret");
    
    // Find user first, then get seller profile using sellerId
    const User = (await import("../models/User.js")).default;
    const user = await User.findById(decoded.userId);
    if (!user || !user.roles.includes("seller")) {
      return res.status(401).json({ success: false, message: "Invalid seller token" });
    }

    const seller = await Seller.findOne({ sellerId: user.sellerId });
    if (!seller) {
      return res.status(401).json({ success: false, message: "Seller profile not found" });
    }

    req.user = user;
    req.seller = seller;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// ----------------------
// SELLER REGISTRATION
// ----------------------
router.post("/register", async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      password, 
      companyName,
      yearOfEstablishment,
      numberOfEmployees,
      companyAddress,
      factoryAddress,
      contactPerson,
      gstNumber,
      cin,
      pan,
      aboutCompany,
      website,
      yearsInBusiness
    } = req.body;

    // Validation
    if (!name || !email || !phone || !password || !companyName || !companyAddress || !gstNumber) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone, password, company name, company address, and GST number are required"
      });
    }

    if (!contactPerson || !contactPerson.name || !contactPerson.phone || !contactPerson.email) {
      return res.status(400).json({
        success: false,
        message: "Contact person name, phone, and email are required"
      });
    }

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ 
      $or: [{ email }, { phone }, { gstNumber }] 
    });

    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: "Seller with this email, phone, or GST number already exists"
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate unique seller ID
    let sellerId = generateSellerId();
    while (await Seller.findOne({ sellerId })) {
      sellerId = generateSellerId();
    }

    // Create new seller
    const newSeller = new Seller({
      sellerId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: hashedPassword,
      companyName: companyName.trim(),
      yearOfEstablishment,
      numberOfEmployees,
      companyAddress: companyAddress.trim(),
      factoryAddress: factoryAddress ? factoryAddress.trim() : undefined,
      contactPerson: {
        name: contactPerson.name.trim(),
        designation: contactPerson.designation ? contactPerson.designation.trim() : undefined,
        phone: contactPerson.phone.trim(),
        email: contactPerson.email.trim()
      },
      gstNumber: gstNumber.trim(),
      cin: cin ? cin.trim() : undefined,
      pan: pan ? pan.trim() : undefined,
      aboutCompany: aboutCompany ? aboutCompany.trim() : undefined,
      website: website ? website.trim() : undefined,
      yearsInBusiness,
      isVerified: true, // Auto-verify for now
      verified: false, // Admin verification required
      products: []
    });

    await newSeller.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        sellerId: newSeller._id,
        email: newSeller.email,
        sellerIdString: newSeller.sellerId
      },
      process.env.JWT_SECRET || "nexushub-seller-secret",
      { expiresIn: "30d" }
    );

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Return seller data (without password)
    const sellerResponse = {
      _id: newSeller._id,
      sellerId: newSeller.sellerId,
      name: newSeller.name,
      email: newSeller.email,
      phone: newSeller.phone,
      companyName: newSeller.companyName,
      gstNumber: newSeller.gstNumber,
      isVerified: newSeller.isVerified,
      verified: newSeller.verified,
      createdAt: newSeller.createdAt
    };

    res.status(201).json({
      success: true,
      message: "Seller account created successfully",
      seller: sellerResponse
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
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find seller by email
    const seller = await Seller.findOne({ 
      email: email.trim().toLowerCase() 
    });

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, seller.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        sellerId: seller._id,
        email: seller.email,
        sellerIdString: seller.sellerId
      },
      process.env.JWT_SECRET || "nexushub-seller-secret",
      { expiresIn: "30d" }
    );

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Return seller data (without password)
    const sellerResponse = {
      _id: seller._id,
      sellerId: seller.sellerId,
      name: seller.name,
      email: seller.email,
      phone: seller.phone,
      companyName: seller.companyName,
      gstNumber: seller.gstNumber,
      isVerified: seller.isVerified,
      verified: seller.verified
    };

    res.json({
      success: true,
      message: "Login successful",
      seller: sellerResponse
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
router.post("/logout", async (req, res) => {
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
// GET SELLER PROFILE
// ----------------------
router.get("/profile", verifySeller, async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller._id).populate('products');
    
    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    // Get product count
    const productCount = await Product.countDocuments({ sellerId: seller.sellerId });
    
    res.json({
      success: true,
      seller: {
        ...seller.toObject(),
        productCount,
        totalProducts: seller.products.length
      }
    });
  } catch (error) {
    console.error("Error fetching seller profile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching seller profile",
      error: error.message
    });
  }
});

// ----------------------
// UPDATE SELLER PROFILE
// ----------------------
router.put("/profile", verifySeller, async (req, res) => {
  try {
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateData.sellerId;
    delete updateData.email;
    delete updateData.password;
    delete updateData.products;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const updatedSeller = await Seller.findByIdAndUpdate(
      req.seller._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSeller) {
      return res.status(404).json({ 
        success: false, 
        message: "Seller not found" 
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      seller: updatedSeller
    });
  } catch (error) {
    console.error("Error updating seller profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating seller profile",
      error: error.message
    });
  }
});

// ----------------------
// GET SELLER BY ID (Public)
// ----------------------
router.get("/public/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    const seller = await Seller.findOne({ sellerId })
      .select('-password -email -phone') // Exclude sensitive information
      .populate('products');
    
    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    res.json({
      success: true,
      seller
    });
  } catch (error) {
    console.error("Error fetching seller details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching seller details",
      error: error.message
    });
  }
});

// ----------------------
// GET SELLER'S PRODUCTS
// ----------------------
router.get("/products/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 10, search, category } = req.query;
    
    // Build query to get products by sellerId
    let query = { sellerId };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate('sellerProfile', 'sellerId companyName verified companyLogo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching seller products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message
    });
  }
});

// ----------------------
// PUBLIC SELLER PROFILE (for buyers)
// ----------------------
router.get("/public/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    const seller = await Seller.findOne({ sellerId }).select('-password');
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    // Get product count
    const productCount = await Product.countDocuments({ sellerId });
    
    res.json({
      success: true,
      seller: {
        ...seller.toObject(),
        productCount,
        totalProducts: productCount
      }
    });
  } catch (error) {
    console.error("Error fetching public seller profile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching seller profile",
      error: error.message
    });
  }
});

// ----------------------
// PUBLIC SELLER PRODUCTS (for buyers)
// ----------------------
router.get("/products/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 12, search, category } = req.query;
    
    // Verify seller exists
    const seller = await Seller.findOne({ sellerId });
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    // Build query to get products by sellerId
    let query = { sellerId };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate('sellerProfile', 'sellerId companyName verified companyLogo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching seller products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message
    });
  }
});

export default router;
