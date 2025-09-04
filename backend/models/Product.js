// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  priceRange: {
    min: Number,
    max: Number,
  },
  moq: {
    type: Number, // Minimum Order Quantity
    required: true,
  },
  sampleAvailable: {
    type: Boolean,
    default: false,
  },
  samplePrice: {
    type: Number,
  },
  manufacturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  images: [{ type: String }],  // store Cloudinary URLs of images
  videos: [{ type: String }],  // store Cloudinary URLs of videos

  hsCode: String,
  warranty: String,
  returnPolicy: String,
  customization: {
    type: Boolean,
    default: false,
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Product", productSchema);