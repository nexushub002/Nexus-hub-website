// backend/routes/sellerDashboard.js
import express from "express";
import { verifySeller } from "../middleware/sellerAuth.js";
import User from "../models/User.js";
import Manufacturer from "../models/Manufacture.js";
import Product from "../models/Product.js";

const router = express.Router();

router.get("/dashboard", verifySeller, (req, res) => {
  res.json({ message: `Welcome Seller ${req.user.id}` });
});

// Get seller profile with manufacturer info
router.get("/profile", verifySeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    // Get seller user info
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }
    
    // Get or create manufacturer profile with populated products
    let manufacturer = await Manufacturer.findOne({ user: sellerId }).populate('products');
    if (!manufacturer) {
      // Create basic manufacturer profile if it doesn't exist
      manufacturer = await Manufacturer.create({
        user: sellerId,
        companyName: seller.businessName || seller.name || 'Company Name',
        companyAddress: seller.companyAddress?.street || 'Address not provided',
        contactPerson: {
          name: seller.name || 'Contact Person',
          phone: seller.phone || '0000000000',
          email: seller.email || 'email@example.com'
        },
        gstin: seller.gstNumber || '',
        verified: false,
        products: []
      });
    }
    
    // Get product count
    const productCount = await Product.countDocuments({ seller: sellerId });
    
    res.json({
      success: true,
      seller: {
        ...seller.toObject(),
        manufacturerProfile: manufacturer,
        productCount
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

// Get manufacturer details by ID (for buyers to view seller profile)
router.get("/manufacturer/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const manufacturer = await Manufacturer.findById(id)
      .populate('user', 'name email phone businessName createdAt')
      .populate('products');
    
    if (!manufacturer) {
      return res.status(404).json({ success: false, message: "Manufacturer not found" });
    }
    
    res.json({
      success: true,
      manufacturer
    });
  } catch (error) {
    console.error("Error fetching manufacturer details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching manufacturer details",
      error: error.message
    });
  }
});

// Update manufacturer profile
router.put("/manufacturer/profile", verifySeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const updateData = req.body;
    
    // Find manufacturer profile
    const manufacturer = await Manufacturer.findOne({ user: sellerId });
    if (!manufacturer) {
      return res.status(404).json({ success: false, message: "Manufacturer profile not found" });
    }
    
    // Update manufacturer profile
    const updatedManufacturer = await Manufacturer.findByIdAndUpdate(
      manufacturer._id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: "Manufacturer profile updated successfully",
      manufacturer: updatedManufacturer
    });
  } catch (error) {
    console.error("Error updating manufacturer profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating manufacturer profile",
      error: error.message
    });
  }
});

// Add documents to manufacturer profile
router.post("/manufacturer/documents", verifySeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { documents } = req.body; // Array of document objects with url, originalName, etc.
    
    const manufacturer = await Manufacturer.findOne({ user: sellerId });
    if (!manufacturer) {
      return res.status(404).json({ success: false, message: "Manufacturer profile not found" });
    }
    
    // Add documents to existing array
    manufacturer.documents.push(...documents);
    await manufacturer.save();
    
    res.json({
      success: true,
      message: "Documents added successfully",
      documents: manufacturer.documents
    });
  } catch (error) {
    console.error("Error adding documents:", error);
    res.status(500).json({
      success: false,
      message: "Error adding documents",
      error: error.message
    });
  }
});

// Add certificates to manufacturer profile
router.post("/manufacturer/certificates", verifySeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { certificates } = req.body; // Array of certificate objects
    
    const manufacturer = await Manufacturer.findOne({ user: sellerId });
    if (!manufacturer) {
      return res.status(404).json({ success: false, message: "Manufacturer profile not found" });
    }
    
    // Add certificates to existing array
    manufacturer.certificates.push(...certificates);
    await manufacturer.save();
    
    res.json({
      success: true,
      message: "Certificates added successfully",
      certificates: manufacturer.certificates
    });
  } catch (error) {
    console.error("Error adding certificates:", error);
    res.status(500).json({
      success: false,
      message: "Error adding certificates",
      error: error.message
    });
  }
});

// Update company logo
router.put("/manufacturer/logo", verifySeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { logo } = req.body; // Logo object with url, originalName, etc.
    
    const manufacturer = await Manufacturer.findOne({ user: sellerId });
    if (!manufacturer) {
      return res.status(404).json({ success: false, message: "Manufacturer profile not found" });
    }
    
    // Update company logo
    manufacturer.companyLogo = logo;
    await manufacturer.save();
    
    res.json({
      success: true,
      message: "Company logo updated successfully",
      logo: manufacturer.companyLogo
    });
  } catch (error) {
    console.error("Error updating logo:", error);
    res.status(500).json({
      success: false,
      message: "Error updating logo",
      error: error.message
    });
  }
});

// Delete document
router.delete("/manufacturer/documents/:documentId", verifySeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { documentId } = req.params;
    
    const manufacturer = await Manufacturer.findOne({ user: sellerId });
    if (!manufacturer) {
      return res.status(404).json({ success: false, message: "Manufacturer profile not found" });
    }
    
    // Remove document from array
    manufacturer.documents = manufacturer.documents.filter(
      doc => doc._id.toString() !== documentId
    );
    await manufacturer.save();
    
    res.json({
      success: true,
      message: "Document deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting document",
      error: error.message
    });
  }
});

// Delete certificate
router.delete("/manufacturer/certificates/:certificateId", verifySeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { certificateId } = req.params;
    
    const manufacturer = await Manufacturer.findOne({ user: sellerId });
    if (!manufacturer) {
      return res.status(404).json({ success: false, message: "Manufacturer profile not found" });
    }
    
    // Remove certificate from array
    manufacturer.certificates = manufacturer.certificates.filter(
      cert => cert._id.toString() !== certificateId
    );
    await manufacturer.save();
    
    res.json({
      success: true,
      message: "Certificate deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting certificate:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting certificate",
      error: error.message
    });
  }
});

// Get seller's own products only
router.get("/my-products", verifySeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { page = 1, limit = 10, search, category } = req.query;
    
    // Build query to get only this seller's products
    let query = { seller: sellerId };
    
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
      .populate('manufacturer', 'companyName verified')
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

// Get single product by ID (only if it belongs to the seller)
router.get("/my-products/:productId", verifySeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { productId } = req.params;

    const product = await Product.findOne({ 
      _id: productId, 
      seller: sellerId 
    }).populate('manufacturer', 'companyName verified');

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

// Update product (only if it belongs to the seller)
router.put("/my-products/:productId", verifySeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { productId } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.seller;
    delete updateData.manufacturer;
    delete updateData.createdAt;

    const product = await Product.findOneAndUpdate(
      { _id: productId, seller: sellerId },
      updateData,
      { new: true, runValidators: true }
    ).populate('manufacturer', 'companyName verified');

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

// Delete product (only if it belongs to the seller)
router.delete("/my-products/:productId", verifySeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { productId } = req.params;

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

    // Remove product from manufacturer's products array
    if (product.manufacturer) {
      await Manufacturer.findByIdAndUpdate(
        product.manufacturer,
        { $pull: { products: productId } }
      );
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

export default router;
