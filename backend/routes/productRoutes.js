// routes/productRoutes.js
import express from "express";
import Product from "../models/Product.js";
import { uploadImages, uploadVideos } from "../middleware/upload.js";

const router = express.Router();

// ✅ Create a product with multiple images + videos
router.post(
  "/",
  (req, res, next) => {
    // Use both uploaders in one go
    const upload = [
      { name: "images", maxCount: 5 }, // up to 5 images
      { name: "videos", maxCount: 2 }, // up to 2 videos
    ];

    // Combine both image + video fields
    const handleUpload = (req, res, cb) => {
      uploadImages.fields([{ name: "images", maxCount: 5 }])(req, res, (err) => {
        if (err) return cb(err);
        uploadVideos.fields([{ name: "videos", maxCount: 2 }])(req, res, cb);
      });
    };

    handleUpload(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  },
  async (req, res) => {
    try {
      const {
        name,
        category,
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
      } = req.body;

      // ✅ Collect uploaded file URLs separately
      const imageUrls = req.files?.images?.map((f) => f.path) || [];
      const videoUrls = req.files?.videos?.map((f) => f.path) || [];

      const product = new Product({
        name,
        category,
        description,
        price,
        priceRange: { min: priceRangeMin, max: priceRangeMax },
        moq,
        sampleAvailable,
        samplePrice,
        manufacturerId,
        images: imageUrls,
        videos: videoUrls,
        hsCode,
        warranty,
        returnPolicy,
        customization,
      });

      await product.save();
      res.status(201).json({ success: true, product });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error uploading product" });
    }
  }
);



export default router;