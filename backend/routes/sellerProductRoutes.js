import express from "express";
import Product from "../models/Product.js";
import { verifySeller } from "../middleware/sellerAuth.js";

const router = express.Router();

// Get all products for the authenticated seller only
router.get("/my-products", verifySeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    const products = await Product.find({ 
      seller: sellerId 
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      products,
      count: products.length
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

// Get single product (only if owned by seller)
router.get("/product/:id", verifySeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const productId = req.params.id;
    
    const product = await Product.findOne({
      _id: productId,
      seller: sellerId
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you don't have permission to view it"
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

// Create new product
router.post("/create", verifySeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const {
      name,
      description,
      price,
      category,
      stock,
      images,
      specifications
    } = req.body;
    
    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and category are required"
      });
    }
    
    const newProduct = new Product({
      name,
      description,
      price,
      category,
      stock: stock || 0,
      images: images || [],
      specifications: specifications || {},
      seller: sellerId,
      status: 'active'
    });
    
    await newProduct.save();
    
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct
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

// Update product (only if owned by seller)
router.put("/update/:id", verifySeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const productId = req.params.id;
    
    // First check if product exists and belongs to seller
    const existingProduct = await Product.findOne({
      _id: productId,
      seller: sellerId
    });
    
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you don't have permission to edit it"
      });
    }
    
    const updateData = req.body;
    delete updateData.seller; // Prevent seller field modification
    
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
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

// Delete product (only if owned by seller)
router.delete("/delete/:id", verifySeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const productId = req.params.id;
    
    const product = await Product.findOneAndDelete({
      _id: productId,
      seller: sellerId
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you don't have permission to delete it"
      });
    }
    
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

// Get seller dashboard stats
router.get("/dashboard-stats", verifySeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    const totalProducts = await Product.countDocuments({ seller: sellerId });
    const activeProducts = await Product.countDocuments({ 
      seller: sellerId, 
      status: 'active' 
    });
    
    // Get recent products
    const recentProducts = await Product.find({ seller: sellerId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        totalOrders: 0, // Will be implemented with order system
        totalRevenue: 0 // Will be calculated from orders
      },
      products: recentProducts
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats",
      error: error.message
    });
  }
});

export default router;
