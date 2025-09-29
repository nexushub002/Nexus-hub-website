// models/Product.js
import mongoose from "mongoose";

// Define the allowed categories and their subcategories
const CATEGORIES = {
  "Apparel & Accessories": [
    "Men's Clothing",
    "Women's Clothing", 
    "Children's Clothing",
    "Shoes & Footwear",
    "Bags & Handbags",
    "Watches",
    "Belts & Accessories",
    "Jewelry & Accessories",
    "Sports & Activewear",
    "Underwear & Lingerie"
  ],
  "Consumer Electronics": [
    "Mobile Phones & Accessories",
    "Computers & Laptops",
    "Audio & Video Equipment",
    "Gaming Consoles & Accessories",
    "Cameras & Photography",
    "Home Appliances",
    "Smart Home Devices",
    "Wearable Technology",
    "Electronic Components",
    "Office Electronics"
  ],
  "Jewelry": [
    "Rings",
    "Necklaces & Pendants",
    "Earrings",
    "Bracelets & Bangles",
    "Watches",
    "Brooches & Pins",
    "Anklets",
    "Cufflinks",
    "Tie Clips",
    "Jewelry Sets"
  ]
};

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: Object.keys(CATEGORIES),
    validate: {
      validator: function(v) {
        return Object.keys(CATEGORIES).includes(v);
      },
      message: 'Category must be one of: ' + Object.keys(CATEGORIES).join(', ')
    }
  },
  subcategory: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return CATEGORIES[this.category] && CATEGORIES[this.category].includes(v);
      },
      message: function(props) {
        return `Subcategory must be one of: ${CATEGORIES[props.category] ? CATEGORIES[props.category].join(', ') : 'Invalid category'}`;
      }
    }
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
    min: 1,
  },
  sampleAvailable: {
    type: Boolean,
    default: false,
  },
  samplePrice: {
    type: Number,
    min: 0,
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

// Static method to get available categories and subcategories
productSchema.statics.getCategories = function() {
  return CATEGORIES;
};

// Static method to get subcategories for a specific category
productSchema.statics.getSubcategories = function(category) {
  return CATEGORIES[category] || [];
};

export default mongoose.model("Product", productSchema);