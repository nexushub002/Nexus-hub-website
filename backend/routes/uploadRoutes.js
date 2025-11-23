// routes/uploadRoutes.js
import express from "express";
import { uploadImages, uploadVideos, uploadDocuments, uploadCertificates, uploadLogo, uploadFactoryVideo } from "../middleware/upload.js";

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

// ✅ Upload videos to Cloudinary
router.post("/videos", uploadVideos.array("videos", 3), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No videos uploaded" 
      });
    }

    // Extract Cloudinary URLs from uploaded files
    const videoUrls = req.files.map(file => file.path);
    
    res.json({ 
      success: true, 
      videos: videoUrls,
      message: `${videoUrls.length} video(s) uploaded successfully`
    });
  } catch (error) {
    console.error("Video upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error uploading videos" 
    });
  }
});

// ✅ Upload manufacturer documents to Cloudinary
router.post("/documents", uploadDocuments.array("documents", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No documents uploaded" 
      });
    }

    // Extract Cloudinary URLs from uploaded files
    const documentUrls = req.files.map(file => ({
      url: file.path,
      originalName: file.originalname,
      format: file.format,
      resourceType: file.resource_type
    }));
    
    res.json({ 
      success: true, 
      documents: documentUrls,
      message: `${documentUrls.length} document(s) uploaded successfully`
    });
  } catch (error) {
    console.error("Document upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error uploading documents" 
    });
  }
});

// ✅ Upload manufacturer certificates to Cloudinary
router.post("/certificates", uploadCertificates.array("certificates", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No certificates uploaded" 
      });
    }

    // Extract Cloudinary URLs from uploaded files
    const certificateUrls = req.files.map(file => ({
      url: file.path,
      originalName: file.originalname,
      format: file.format,
      resourceType: file.resource_type
    }));
    
    res.json({ 
      success: true, 
      certificates: certificateUrls,
      message: `${certificateUrls.length} certificate(s) uploaded successfully`
    });
  } catch (error) {
    console.error("Certificate upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error uploading certificates" 
    });
  }
});

// ✅ Upload company logo to Cloudinary
router.post("/logo", uploadLogo.single("logo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No logo uploaded" 
      });
    }

    res.json({ 
      success: true, 
      logo: {
        url: req.file.path,
        originalName: req.file.originalname,
        format: req.file.format
      },
      message: "Logo uploaded successfully"
    });
  } catch (error) {
    console.error("Logo upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error uploading logo" 
    });
  }
});

// ✅ Upload factory videos to Cloudinary (max 3)
router.post("/factory-videos", uploadFactoryVideo.array("factoryVideos", 3), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No factory videos uploaded" 
      });
    }

    // Extract Cloudinary URLs from uploaded files
    const factoryVideos = req.files.map(file => ({
      url: file.path,
      originalName: file.originalname,
      format: file.format,
      resourceType: file.resource_type || "video"
    }));

    res.json({ 
      success: true, 
      factoryVideos: factoryVideos,
      message: `${factoryVideos.length} factory video(s) uploaded successfully`
    });
  } catch (error) {
    console.error("Factory video upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error uploading factory videos" 
    });
  }
});

export default router;
