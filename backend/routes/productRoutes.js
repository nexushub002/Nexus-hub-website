// routes/productRoutes.js
import express from "express";
import Product from "../models/Product.js";
import { uploadImages, uploadVideos } from "../middleware/upload.js";

const router = express.Router();

// ✅ Create a product (images are uploaded separately)
router.post("/", async (req, res) => {
  try {
    const {
      name,
      category,
      subcategory,
      description,
      price,
      priceRangeMin,
      priceRangeMax,
      moq,
      sampleAvailable,
      samplePrice,
      manufacturerId,
      hsCode,
      warranty,
      returnPolicy,
      customization,
      images, // Array of Cloudinary URLs
    } = req.body;

    const product = new Product({
      name,
      category,
      subcategory,
      description,
      price,
      priceRange: { min: priceRangeMin, max: priceRangeMax },
      moq,
      sampleAvailable,
      samplePrice,
      manufacturerId,
      images: images || [], // Cloudinary URLs
      videos: [], // No videos for now
      hsCode,
      warranty,
      returnPolicy,
      customization,
    });

    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error creating product" });
  }
});

// ✅ Get categories and subcategories
router.get("/categories", async (req, res) => {
  try {
    const categories = Product.getCategories();
    res.json({ success: true, categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching categories" });
  }
});

// ✅ Get subcategories for a specific category
router.get("/categories/:category/subcategories", async (req, res) => {
  try {
    const { category } = req.params;
    const subcategories = Product.getSubcategories(category);
    res.json({ success: true, subcategories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching subcategories" });
  }
});

export default router;