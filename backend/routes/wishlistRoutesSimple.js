// routes/wishlistRoutesSimple.js - Temporary version without authentication for testing
import express from "express";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

const router = express.Router();

// Test route to check if wishlist API is working
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Wishlist API is working!" });
});

// Add product to wishlist (simplified version)
router.post("/add", async (req, res) => {
  try {
    const { productId, userId } = req.body;
    
    console.log('Received request:', { productId, userId });

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }

    // For testing, use a default user ID if not provided
    const testUserId = userId || "60f7b3b3b3b3b3b3b3b3b3b3"; // Replace with actual user ID

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({ userId: testUserId, productId });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist"
      });
    }

    // Add to wishlist
    const wishlistItem = new Wishlist({ 
      userId: testUserId, 
      productId 
    });
    await wishlistItem.save();

    const count = await Wishlist.countDocuments({ userId: testUserId });
    
    res.json({
      success: true,
      message: "Product added to wishlist",
      count
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist",
      error: error.message
    });
  }
});

// Get wishlist (simplified)
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId || "60f7b3b3b3b3b3b3b3b3b3b3"; // Default test user
    
    const wishlistItems = await Wishlist.find({ userId })
      .populate({
        path: 'productId',
        select: 'name price priceRange images category subcategory moq sampleAvailable samplePrice'
      })
      .sort({ addedAt: -1 });
    
    // Format the response
    const formattedItems = wishlistItems.map(item => ({
      _id: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      priceRange: item.productId.priceRange,
      images: item.productId.images,
      category: item.productId.category,
      subcategory: item.productId.subcategory,
      moq: item.productId.moq,
      sampleAvailable: item.productId.sampleAvailable,
      samplePrice: item.productId.samplePrice,
      addedAt: item.addedAt
    }));

    res.json({
      success: true,
      wishlist: formattedItems,
      count: formattedItems.length
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist"
    });
  }
});

// Remove from wishlist (simplified)
router.delete("/remove/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.query.userId || "60f7b3b3b3b3b3b3b3b3b3b3"; // Default test user

    const result = await Wishlist.deleteOne({ userId, productId });
    
    if (result.deletedCount > 0) {
      const count = await Wishlist.countDocuments({ userId });
      res.json({
        success: true,
        message: "Product removed from wishlist",
        count
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Product not found in wishlist"
      });
    }
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist"
    });
  }
});

export default router;
