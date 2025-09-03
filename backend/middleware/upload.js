// middleware/upload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Setup different storage for images and videos
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products/images",
    resource_type: "image",  // restrict to images
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products/videos",
    resource_type: "video", // restrict to videos
    allowed_formats: ["mp4", "mov", "avi", "mkv"],
  },
});

export const uploadImages = multer({ storage: imageStorage });
export const uploadVideos = multer({ storage: videoStorage });
