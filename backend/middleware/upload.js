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

// Setup storage for manufacturer documents
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "manufacturer/documents",
    resource_type: "auto", // auto-detect file type
    allowed_formats: ["pdf", "doc", "docx", "jpg", "jpeg", "png"],
  },
});

// Setup storage for manufacturer certificates
const certificateStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "manufacturer/certificates",
    resource_type: "auto",
    allowed_formats: ["pdf", "jpg", "jpeg", "png"],
  },
});

// Setup storage for company logo
const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "manufacturer/logos",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

export const uploadImages = multer({ storage: imageStorage });
export const uploadVideos = multer({ storage: videoStorage });
export const uploadDocuments = multer({ storage: documentStorage });
export const uploadCertificates = multer({ storage: certificateStorage });
export const uploadLogo = multer({ storage: logoStorage });
