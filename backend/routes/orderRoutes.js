import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Get current user's orders
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const userId = req.session.userId;
    const orders = await Order.find({ user: userId })
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Error fetching orders", error: error.message });
  }
});

// Create a new order for the current user
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { items = [], shippingAddress = {}, paymentMethod = "cod", orderNotes } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "No order items provided" });
    }

    // Validate products and compute total from DB
    const productIds = items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: productIds } }).select("price");
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = items.map((i) => {
      const p = productMap.get(i.product);
      if (!p) throw new Error("Product not found: " + i.product);
      const quantity = Number(i.quantity || 1);
      const price = Number(p.price); // trust DB price
      return { product: i.product, quantity, price };
    });

    const totalAmount = orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0);

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      status: "pending",
      shippingAddress,
      paymentMethod,
      orderNotes,
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, message: "Failed to create order", error: error.message });
  }
});

// Get a single order ensuring it belongs to the user
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.session.userId;
    const order = await Order.findOne({ _id: req.params.id, user: userId })
      .populate("items.product", "name price images description");

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (error) {
    console.error("Fetch order error:", error);
    res.status(500).json({ success: false, message: "Error fetching order", error: error.message });
  }
});

export default router;
