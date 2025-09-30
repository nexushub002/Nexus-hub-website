import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { verifySeller } from "../middleware/sellerAuth.js";

const router = express.Router();

// Get all orders for products owned by the authenticated seller
router.get("/my-orders", verifySeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    // First get all products owned by this seller
    const sellerProducts = await Product.find({ seller: sellerId }).select('_id');
    const productIds = sellerProducts.map(product => product._id);
    
    // Find orders containing products from this seller
    const orders = await Order.find({
      'items.product': { $in: productIds }
    })
    .populate('user', 'name email phone')
    .populate('items.product', 'name price images')
    .sort({ createdAt: -1 });
    
    // Filter order items to only show this seller's products
    const sellerOrders = orders.map(order => {
      const sellerItems = order.items.filter(item => 
        productIds.some(id => id.toString() === item.product._id.toString())
      );
      
      if (sellerItems.length > 0) {
        return {
          ...order.toObject(),
          items: sellerItems,
          // Calculate seller-specific total
          sellerTotal: sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };
      }
      return null;
    }).filter(order => order !== null);
    
    res.json({
      success: true,
      orders: sellerOrders,
      count: sellerOrders.length
    });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message
    });
  }
});

// Get single order details (only if it contains seller's products)
router.get("/order/:id", verifySeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const orderId = req.params.id;
    
    // Get seller's products
    const sellerProducts = await Product.find({ seller: sellerId }).select('_id');
    const productIds = sellerProducts.map(product => product._id);
    
    const order = await Order.findById(orderId)
      .populate('user', 'name email phone address')
      .populate('items.product', 'name price images description');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    // Check if order contains seller's products
    const sellerItems = order.items.filter(item => 
      productIds.some(id => id.toString() === item.product._id.toString())
    );
    
    if (sellerItems.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this order"
      });
    }
    
    // Return order with only seller's items
    const sellerOrder = {
      ...order.toObject(),
      items: sellerItems,
      sellerTotal: sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    res.json({
      success: true,
      order: sellerOrder
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message
    });
  }
});

// Update order status for seller's products
router.put("/update-status/:id", verifySeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const orderId = req.params.id;
    const { status, itemId } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }
    
    // Get seller's products
    const sellerProducts = await Product.find({ seller: sellerId }).select('_id');
    const productIds = sellerProducts.map(product => product._id);
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    // Find the specific item and verify it belongs to seller
    const itemIndex = order.items.findIndex(item => 
      item._id.toString() === itemId && 
      productIds.some(id => id.toString() === item.product.toString())
    );
    
    if (itemIndex === -1) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this item"
      });
    }
    
    // Update the specific item status
    order.items[itemIndex].status = status;
    order.items[itemIndex].updatedAt = new Date();
    
    await order.save();
    
    res.json({
      success: true,
      message: "Order status updated successfully",
      order
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message
    });
  }
});

// Get order statistics for seller
router.get("/order-stats", verifySeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    // Get seller's products
    const sellerProducts = await Product.find({ seller: sellerId }).select('_id');
    const productIds = sellerProducts.map(product => product._id);
    
    // Get orders containing seller's products
    const orders = await Order.find({
      'items.product': { $in: productIds }
    });
    
    let totalOrders = 0;
    let totalRevenue = 0;
    let pendingOrders = 0;
    let completedOrders = 0;
    
    orders.forEach(order => {
      const sellerItems = order.items.filter(item => 
        productIds.some(id => id.toString() === item.product.toString())
      );
      
      if (sellerItems.length > 0) {
        totalOrders++;
        totalRevenue += sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const hasCompleted = sellerItems.some(item => item.status === 'delivered');
        const hasPending = sellerItems.some(item => ['pending', 'confirmed', 'processing'].includes(item.status));
        
        if (hasCompleted) completedOrders++;
        if (hasPending) pendingOrders++;
      }
    });
    
    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders
      }
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order statistics",
      error: error.message
    });
  }
});

export default router;
