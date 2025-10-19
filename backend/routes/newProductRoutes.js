import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Seller from "../models/SellerProfile.js";
import Product from "../models/Product.js";

const router = express.Router();

// Middleware to verify seller token
const verifySeller = async (req, res, next) => {
  try {
    // Check for token in cookies first, then in Authorization header
    let token = req.cookies.token;
    
    if (!token) {
      // Check Authorization header (Bearer token)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7); // Remove 'Bearer ' prefix
      }
    }
    
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "nexushub-seller-secret");
    
    // Find user first, then get seller profile using sellerId
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
// CREATE PRODUCT
// ----------------------
router.post("/create", verifySeller, async (req, res) => {
  try {
    const {
      name,
      category,
      subcategory,
      categoryKey,
      subcategoryKey,
      description,
      price,
      priceRangeMin,
      priceRangeMax,
      moq,
      sampleAvailable,
      samplePrice,
      hsCode,
      warranty,
      returnPolicy,
      customization,
      images = [],
      videos = []
    } = req.body;

    // Validation
    if (!name || !category || !subcategory || !price || !moq) {
      return res.status(400).json({
        success: false,
        message: "Name, category, subcategory, price, and MOQ are required"
      });
    }

    const seller = req.seller;

    // Create product
    const product = await Product.create({
      name,
      category,
      subcategory,
      categoryKey,
      subcategoryKey,
      description,
      price,
      priceRange: { min: priceRangeMin, max: priceRangeMax },
      moq,
      sampleAvailable,
      samplePrice,
      sellerId: seller.sellerId, // Use seller's unique ID
      sellerProfile: seller._id, // Reference to seller profile
      hsCode,
      warranty,
      returnPolicy,
      customization,
      images,
      videos
    });

    // Add product ID to seller's products array
    await Seller.findByIdAndUpdate(
      seller._id,
      { $push: { products: product._id } },
      { new: true }
    );

    // Populate seller information in response
    const populatedProduct = await Product.findById(product._id)
      .populate('sellerProfile', 'sellerId companyName verified companyLogo');

    res.status(201).json({ 
      success: true, 
      message: "Product created successfully",
      product: populatedProduct 
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error creating product",
      error: error.message 
    });
  }
});

// ----------------------
// GET SELLER'S PRODUCTS
// ----------------------
router.get("/my-products", verifySeller, async (req, res) => {
  try {
    const seller = req.seller;
    const { page = 1, limit = 10, search, category } = req.query;
    
    // Build query to get only this seller's products
    let query = { sellerId: seller.sellerId };
    
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
      count: products.length,
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
// GET SINGLE PRODUCT
// ----------------------
router.get("/product/:id", verifySeller, async (req, res) => {
  try {
    const seller = req.seller;
    const { id } = req.params;

    const product = await Product.findOne({ 
      _id: id, 
      sellerId: seller.sellerId 
    }).populate('sellerProfile', 'sellerId companyName verified companyLogo');

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found or you don't have permission to access it" 
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message
    });
  }
});

// ----------------------
// UPDATE PRODUCT
// ----------------------
router.put("/update/:id", verifySeller, async (req, res) => {
  try {
    const seller = req.seller;
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.sellerId;
    delete updateData.sellerProfile;
    delete updateData.createdAt;

    const product = await Product.findOneAndUpdate(
      { _id: id, sellerId: seller.sellerId },
      updateData,
      { new: true, runValidators: true }
    ).populate('sellerProfile', 'sellerId companyName verified companyLogo');

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found or you don't have permission to update it" 
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message
    });
  }
});

// ----------------------
// DELETE PRODUCT
// ----------------------
router.delete("/delete/:id", verifySeller, async (req, res) => {
  try {
    const seller = req.seller;
    const { id } = req.params;

    const product = await Product.findOneAndDelete({ 
      _id: id, 
      sellerId: seller.sellerId 
    });

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found or you don't have permission to delete it" 
      });
    }

    // Remove product from seller's products array
    await Seller.findByIdAndUpdate(
      seller._id,
      { $pull: { products: id } }
    );

    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message
    });
  }
});

// ----------------------
// GET ALL PRODUCTS (Public - for buyers)
// ----------------------
router.get("/all", async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, sellerId } = req.query;
    
    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (sellerId) {
      query.sellerId = sellerId;
    }

    const products = await Product.find(query)
      .populate('sellerProfile', 'sellerId companyName verified companyLogo yearOfEstablishment')
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
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message
    });
  }
});

// ----------------------
// GET PRODUCT BY ID (Public - for buyers)
// ----------------------
router.get("/public/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('sellerProfile', 'sellerId companyName verified companyLogo yearOfEstablishment contactPerson aboutCompany website');

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Get seller's total products count
    const sellerProductsCount = await Product.countDocuments({ 
      sellerId: product.sellerId 
    });

    // Enhanced response with seller info
    const response = {
      ...product.toObject(),
      sellerInfo: product.sellerProfile ? {
        ...product.sellerProfile.toObject(),
        totalProducts: sellerProductsCount
      } : null
    };

    res.json({
      success: true,
      product: response
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message
    });
  }
});

export default router;
export { verifySeller };
