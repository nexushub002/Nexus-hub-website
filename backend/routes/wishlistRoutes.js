// routes/wishlistRoutes.js
import express from "express";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get user's wishlist
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlistItems = await Wishlist.getUserWishlist(userId);
    
    // Format the response to match frontend expectations
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

// Add product to wishlist
router.post("/add", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const result = await Wishlist.addToWishlist(userId, productId);
    
    if (result.success) {
      const count = await Wishlist.getWishlistCount(userId);
      res.json({
        ...result,
        count
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist"
    });
  }
});

// Remove product from wishlist
router.delete("/remove/:productId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const result = await Wishlist.removeFromWishlist(userId, productId);
    
    if (result.success) {
      const count = await Wishlist.getWishlistCount(userId);
      res.json({
        ...result,
        count
      });
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist"
    });
  }
});

// Check if product is in wishlist
router.get("/check/:productId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const isInWishlist = await Wishlist.isInWishlist(userId, productId);
    
    res.json({
      success: true,
      isInWishlist
    });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check wishlist status"
    });
  }
});

// Clear entire wishlist
router.delete("/clear", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await Wishlist.clearWishlist(userId);
    
    res.json(result);
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear wishlist"
    });
  }
});

// Get wishlist count
router.get("/count", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Wishlist.getWishlistCount(userId);
    
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error("Error getting wishlist count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get wishlist count"
    });
  }
});

export default router;
