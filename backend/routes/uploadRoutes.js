// routes/uploadRoutes.js
import express from "express";
import { uploadImages } from "../middleware/upload.js";

const router = express.Router();

// ✅ Upload images to Cloudinary
router.post("/images", uploadImages.array("images", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No images uploaded" 
      });
    }

    // Extract Cloudinary URLs from uploaded files
    const imageUrls = req.files.map(file => file.path);
    
    res.json({ 
      success: true, 
      images: imageUrls,
      message: `${imageUrls.length} image(s) uploaded successfully`
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error uploading images" 
    });
  }
});

export default router;
