import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Seller from "../models/SellerProfile.js";
import { verifyAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Normalize email (lowercase and trim)
    const normalizedEmail = email.trim().toLowerCase();

    console.log(`🔍 Admin login attempt for: ${normalizedEmail}`);

    // Find user with admin role in MongoDB (case-insensitive email search)
    const admin = await User.findOne({ 
      $or: [
        { email: normalizedEmail },
        { email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } }
      ],
      roles: { $in: ["admin"] }
    });

    if (!admin) {
      console.log(`❌ Admin login attempt failed: User not found or not admin - ${normalizedEmail}`);
      // Check if user exists but doesn't have admin role
      const userExists = await User.findOne({ 
        $or: [
          { email: normalizedEmail },
          { email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } }
        ]
      });
      if (userExists) {
        console.log(`   ⚠️  User exists but roles are: ${JSON.stringify(userExists.roles)}`);
      }
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log(`✅ Admin user found: ${admin.email}, Roles: ${admin.roles.join(", ")}`);

    // Verify password against MongoDB
    if (!admin.password) {
      console.log(`❌ Admin login attempt failed: No password set for user - ${normalizedEmail}`);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      console.log(`❌ Admin login attempt failed: Invalid password for - ${normalizedEmail}`);
      console.log(`   Password provided: ${password ? 'Yes' : 'No'}`);
      console.log(`   Admin has password: ${admin.password ? 'Yes' : 'No'}`);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log(`✅ Admin login successful: ${normalizedEmail}`);

    // Generate JWT token
    const token = jwt.sign(
      { userId: admin._id, role: "admin" },
      process.env.JWT_SECRET || "nexushub-secret",
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: "Login successful",
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        roles: admin.roles,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Admin Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({
    success: true,
    message: "Logout successful",
  });
});

// Verify Admin
router.get("/verify", verifyAdmin, async (req, res) => {
  res.json({
    success: true,
    admin: {
      _id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      roles: req.admin.roles,
    },
  });
});

// Get Dashboard Stats
router.get("/stats", verifyAdmin, async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalSellers, totalOrders] = await Promise.all([
      User.countDocuments({ roles: { $ne: "admin" } }),
      Product.countDocuments(),
      Seller.countDocuments(),
      Order.countDocuments(),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalSellers,
        totalOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
    });
  }
});

// Get All Users
router.get("/users", verifyAdmin, async (req, res) => {
  try {
    const { search } = req.query;
    let query = { roles: { $ne: "admin" } };
    
    // If search query provided, search by mobile or phone
    if (search) {
      query.$or = [
        { mobile: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { _id: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
    });
  }
});

// Get All Products
router.get("/products", verifyAdmin, async (req, res) => {
  try {
    const products = await Product.find()
      .populate("sellerId", "name companyName email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
    });
  }
});

// Get All Sellers
router.get("/sellers", verifyAdmin, async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    // If search query provided, search by email or phone/mobile
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    const sellers = await Seller.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      sellers,
    });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sellers",
    });
  }
});


// Get Seller's Full Profile (for admin)
router.get("/sellers/:sellerId/profile", verifyAdmin, async (req, res) => {
  try {
    const { sellerId } = req.params;
    console.log("Fetching seller profile for sellerId:", sellerId);
    
    const seller = await Seller.findOne({ sellerId })
      .select('-password'); // Exclude password

    if (!seller) {
      console.log("Seller not found with sellerId:", sellerId);
      return res.status(404).json({
        success: false,
        message: `Seller not found with ID: ${sellerId}`,
      });
    }

    console.log("Seller profile found:", seller.companyName || seller.name);
    res.json({
      success: true,
      seller,
    });
  } catch (error) {
    console.error("Error fetching seller profile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching seller profile",
      error: error.message,
    });
  }
});

// Update Seller's Full Profile (for admin)
router.put("/sellers/:sellerId/profile", verifyAdmin, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const updateData = { ...req.body };
    
    console.log("Updating seller profile for sellerId:", sellerId);
    console.log("Update data received:", updateData);
    
    // Remove fields that shouldn't be updated
    delete updateData.sellerId;
    delete updateData.password;
    delete updateData.products;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData._id;
    delete updateData.__v;

    // Find seller by sellerId
    const seller = await Seller.findOne({ sellerId });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: `Seller not found with ID: ${sellerId}`,
      });
    }

    // Handle contactPerson object update
    if (updateData.contactPerson && typeof updateData.contactPerson === 'object') {
      // Merge contactPerson fields
      updateData.contactPerson = {
        ...(seller.contactPerson || {}),
        ...updateData.contactPerson,
      };
    }

    // Validate shop name if it's being changed
    if (updateData.shopName && updateData.shopName.trim() !== '') {
      const normalizedShopName = updateData.shopName.trim().toLowerCase();
      const currentShopName = seller.shopName ? seller.shopName.toLowerCase() : '';

      // Only check if shop name is actually changing
      if (normalizedShopName !== currentShopName) {
        const existingSeller = await Seller.findOne({
          shopName: new RegExp(`^${normalizedShopName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
          _id: { $ne: seller._id },
        });

        if (existingSeller) {
          return res.status(400).json({
            success: false,
            message: "This shop name is already taken by another seller. Please choose a different name.",
          });
        }
      }
    }

    // Update seller profile
    const updatedSeller = await Seller.findOneAndUpdate(
      { sellerId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedSeller) {
      return res.status(500).json({
        success: false,
        message: "Failed to update seller profile",
      });
    }

    console.log("Seller profile updated successfully:", updatedSeller.companyName || updatedSeller.name);

    res.json({
      success: true,
      message: "Seller profile updated successfully",
      seller: updatedSeller,
    });
  } catch (error) {
    console.error("Error updating seller profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating seller profile",
      error: error.message,
    });
  }
});

// Check Shop Name Availability (for admin)
router.get("/check-shop-name", verifyAdmin, async (req, res) => {
  try {
    const { shopName, excludeSellerId } = req.query;

    if (!shopName || shopName.trim() === '') {
      return res.json({
        success: true,
        available: true,
        message: "Shop name is empty",
      });
    }

    // Normalize shop name (trim and lowercase for comparison)
    const normalizedShopName = shopName.trim().toLowerCase();

    // Build query to check if shop name exists
    let query = { shopName: new RegExp(`^${normalizedShopName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") };

    // Exclude current seller if provided
    if (excludeSellerId) {
      const excludeSeller = await Seller.findOne({ sellerId: excludeSellerId });
      if (excludeSeller) {
        query._id = { $ne: excludeSeller._id };
      }
    }

    const existingSeller = await Seller.findOne(query);

    if (existingSeller) {
      return res.json({
        success: true,
        available: false,
        message: "Shop name is already taken",
      });
    }

    res.json({
      success: true,
      available: true,
      message: "Shop name is available",
    });
  } catch (error) {
    console.error("Error checking shop name:", error);
    res.status(500).json({
      success: false,
      message: "Error checking shop name availability",
      error: error.message,
    });
  }
});

// Get Seller's Products
router.get("/sellers/:sellerId/products", verifyAdmin, async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    const products = await Product.find({ sellerId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
      count: products.length,
    });
  } catch (error) {
    console.error("Error fetching seller products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching seller products",
    });
  }
});

// Update Product (Admin)
router.put("/products/:productId", verifyAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
    });
  }
});

// Delete Product (Admin)
router.delete("/products/:productId", verifyAdmin, async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Remove product from seller's products array
    await Seller.findByIdAndUpdate(
      product.sellerProfile,
      { $pull: { products: productId } }
    );

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
    });
  }
});

// UPDATE SELLER ID (for admin)
router.put("/sellers/:sellerId/update-id", verifyAdmin, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { newSellerId } = req.body;

    if (!newSellerId || newSellerId.trim() === '') {
      return res.status(400).json({ success: false, message: "New seller ID is required" });
    }

    // Check if new seller ID already exists
    const existingSeller = await Seller.findOne({ sellerId: newSellerId.trim() });
    if (existingSeller && existingSeller.sellerId !== sellerId) {
      return res.status(400).json({ success: false, message: "Seller ID already exists" });
    }

    // Find and update the seller profile
    const seller = await Seller.findOneAndUpdate(
      { sellerId },
      { sellerId: newSellerId.trim() },
      { new: true }
    );

    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    // Update sellerId in User model
    await User.findOneAndUpdate(
      { sellerId },
      { sellerId: newSellerId.trim() }
    );

    // Update sellerId in all products
    await Product.updateMany(
      { sellerId },
      { sellerId: newSellerId.trim() }
    );

    res.json({
      success: true,
      message: "Seller ID updated successfully",
      seller,
    });
  } catch (error) {
    console.error("Error updating seller ID:", error);
    res.status(500).json({ success: false, message: "Error updating seller ID" });
  }
});

// Suspend Seller
router.put("/sellers/:sellerId/suspend", verifyAdmin, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { suspended } = req.body;

    // Update seller - add suspended field if it doesn't exist
    const seller = await Seller.findOneAndUpdate(
      { sellerId },
      { $set: { suspended: suspended !== false, verified: suspended === false } },
      { new: true }
    );

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Also update User model if exists
    await User.findOneAndUpdate(
      { sellerId },
      { $set: { isVerified: suspended === false } }
    );

    res.json({
      success: true,
      message: suspended !== false ? "Seller suspended successfully" : "Seller activated successfully",
      seller: {
        ...seller.toObject(),
        suspended: suspended !== false,
      },
    });
  } catch (error) {
    console.error("Error suspending seller:", error);
    res.status(500).json({
      success: false,
      message: "Error suspending seller",
    });
  }
});

// Delete Seller Account
router.delete("/sellers/:sellerId", verifyAdmin, async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await Seller.findOne({ sellerId });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Delete all seller's products
    await Product.deleteMany({ sellerId });

    // Delete seller profile
    await Seller.findByIdAndDelete(seller._id);

    // Delete user account if exists
    await User.findOneAndDelete({ sellerId });

    res.json({
      success: true,
      message: "Seller account and all associated data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting seller:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting seller",
    });
  }
});

export default router;

