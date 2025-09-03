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



// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     category: {
//       type: String,
//       required: true,
//     },
//     subCategory: {
//       type: String,
//     },
//     description: {
//       type: String,
//     },
//     tags: [String],

//     // Media
//     images: [String], // Cloudinary URLs
//     videos: [String], // Cloudinary URLs

//     // Business & Trade Info
//     price: {
//       type: Number,
//       required: true,
//     },
//     priceRange: {
//       min: Number,
//       max: Number,
//     },
//     moq: {
//       type: Number, // Minimum Order Quantity
//       required: true,
//     },
//     supplyAbility: {
//       type: String, // e.g., "5000 pieces/month"
//     },
//     leadTime: {
//       type: String, // e.g., "15 days after payment"
//     },
//     sampleAvailable: {
//       type: Boolean,
//       default: false,
//     },
//     samplePrice: {
//       type: Number,
//     },

//     // Packaging & Delivery
//     packagingDetails: String,
//     deliveryTime: String,
//     portOfDispatch: String,
//     shippingOptions: [String],

//     // Manufacturer / Seller Info
//     seller: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User", // Link to seller account
//       required: true,
//     },
//     companyName: String,
//     certifications: [String],
//     businessType: {
//       type: String,
//       enum: ["Manufacturer", "Trader", "Distributor", "Wholesaler"],
//     },
//     yearsInBusiness: Number,

//     // Additional
//     variants: [
//       {
//         size: String,
//         color: String,
//         material: String,
//         price: Number,
//       },
//     ],
//     hsCode: String,
//     warranty: String,
//     returnPolicy: String,
//     customization: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Product", productSchema);

