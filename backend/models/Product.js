// models/Product.js
import mongoose from "mongoose";

// Define the allowed categories and their subcategories
// Note: Consumer Electronics category has been removed - focusing on Apparel & Accessories and Jewelry only
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
  // Normalized keys for search and filtering (e.g., Apparel_Accessories, Men_Clothing)
  categoryKey: { type: String, index: true },
  subcategoryKey: { type: String, index: true },
  description: {
    type: String,
    trim: true,
  },
  // Search enhancement fields
  // tags: short descriptive labels (e.g. "eco-friendly", "summer", "B2B")
  tags: {
    type: [String],
    index: true,
    default: [],
  },
  // searchKeywords: extra keywords and synonyms for better matching (e.g. "hoodie", "pullover", "sweatshirt")
  searchKeywords: {
    type: [String],
    index: true,
    default: [],
  },
  // useCases: phrases describing how/where the product is used (e.g. "corporate gifting", "school uniform")
  useCases: {
    type: [String],
    default: [],
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
  // Seller Information - Links product to the seller who created it
  sellerId: {
    type: String,
    required: true,
    index: true, // For efficient querying by seller
  },
  sellerProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
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

// Statics for category info
productSchema.statics.getCategories = function() {
  return CATEGORIES;
};

productSchema.statics.getSubcategories = function(category) {
  return CATEGORIES[category] || [];
};

// Index for normalized key queries
productSchema.index({ categoryKey: 1, subcategoryKey: 1 });

// Index for seller queries
productSchema.index({ sellerId: 1 });
productSchema.index({ sellerProfile: 1 });

// Text index to improve full-text search relevance across key product fields
// Weights determine importance: higher weight = more relevance when matched
productSchema.index(
  {
    name: "text",
    description: "text",
    tags: "text",
    searchKeywords: "text",
    useCases: "text",
    category: "text",
    subcategory: "text",
  },
  {
    weights: {
      name: 10,           // Product name is most important
      tags: 8,            // Tags are very relevant
      searchKeywords: 7,  // Keywords for synonyms
      category: 5,        // Category match
      subcategory: 5,     // Subcategory match
      useCases: 4,        // Use cases for context
      description: 2,     // Description is broad, lower weight
    },
    name: "product_text_search_index"
  }
);

export default mongoose.model("Product", productSchema);