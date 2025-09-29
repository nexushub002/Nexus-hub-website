// routes/cartRoutes.js
import express from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Cart API is working!" });
});

// Get cart items
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId || "60f7b3b3b3b3b3b3b3b3b3b3"; // Default test user
    
    const cartItems = await Cart.getCartItems(userId);
    
    // Format the response
    const formattedItems = cartItems.map(item => ({
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
      quantity: item.quantity,
      addedAt: item.addedAt,
      updatedAt: item.updatedAt
    }));

    const totalItems = await Cart.getCartCount(userId);

    res.json({
      success: true,
      cart: formattedItems,
      count: totalItems,
      totalPrice: formattedItems.reduce((total, item) => {
        const price = item.price || (item.priceRange ? item.priceRange.min : 0);
        return total + (price * item.quantity);
      }, 0)
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart"
    });
  }
});

// Add product to cart
router.post("/add", async (req, res) => {
  try {
    const { productId, userId, quantity = 1 } = req.body;
    
    console.log('Add to cart request:', { productId, userId, quantity });

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }

    // For testing, use a default user ID if not provided
    const testUserId = userId || "60f7b3b3b3b3b3b3b3b3b3b3";

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Add to cart
    const cartItem = await Cart.addToCart(testUserId, productId, quantity);
    const totalCount = await Cart.getCartCount(testUserId);
    
    res.json({
      success: true,
      message: "Product added to cart",
      count: totalCount,
      item: cartItem
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
      error: error.message
    });
  }
});

// Update quantity in cart
router.put("/update/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, userId } = req.body;
    
    const testUserId = userId || "60f7b3b3b3b3b3b3b3b3b3b3";

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity cannot be negative"
      });
    }

    const result = await Cart.updateQuantity(testUserId, productId, quantity);
    const totalCount = await Cart.getCartCount(testUserId);
    
    if (quantity === 0) {
      res.json({
        success: true,
        message: "Product removed from cart",
        count: totalCount
      });
    } else {
      res.json({
        success: true,
        message: "Cart updated",
        count: totalCount,
        item: result
      });
    }
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cart"
    });
  }
});

// Remove from cart
router.delete("/remove/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.query.userId || "60f7b3b3b3b3b3b3b3b3b3b3";

    const result = await Cart.removeFromCart(userId, productId);
    const totalCount = await Cart.getCartCount(userId);
    
    if (result.deletedCount > 0) {
      res.json({
        success: true,
        message: "Product removed from cart",
        count: totalCount
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Product not found in cart"
      });
    }
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove product from cart"
    });
  }
});

// Clear entire cart
router.delete("/clear", async (req, res) => {
  try {
    const userId = req.query.userId || "60f7b3b3b3b3b3b3b3b3b3b3";

    await Cart.clearCart(userId);
    
    res.json({
      success: true,
      message: "Cart cleared",
      count: 0
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart"
    });
  }
});

// Get cart count
router.get("/count", async (req, res) => {
  try {
    const userId = req.query.userId || "60f7b3b3b3b3b3b3b3b3b3b3";
    
    const count = await Cart.getCartCount(userId);
    
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error("Error getting cart count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get cart count"
    });
  }
});

export default router;
