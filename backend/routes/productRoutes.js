// routes/productRoutes.js
import express from "express";
import Product from "../models/Product.js";
import { uploadImages, uploadVideos } from "../middleware/upload.js";

const router = express.Router();

// Mapping labels to normalized keys used in DB
// Note: Consumer Electronics category has been removed - focusing on Apparel & Accessories and Jewelry only
const CATEGORY_KEY_MAP = {
  'Apparel & Accessories': 'Apparel_Accessories',
  'Jewelry': 'Jewelry'
};

const SUBCATEGORY_KEY_MAP = {
  'Apparel & Accessories': {
    "Men's Clothing": 'Men_Clothing',
    "Women's Clothing": 'Women_Clothing',
    "Children's Clothing": 'Children_Clothing',
    'Shoes & Footwear': 'Shoes_Footwear',
    'Bags & Handbags': 'Bags_Handbags',
    'Watches': 'Watches',
    'Belts & Accessories': 'Belts_Accessories',
    'Jewelry & Accessories': 'Jewelry_Accessories',
    'Sports & Activewear': 'Sports_Activewear',
    'Underwear & Lingerie': 'Underwear_Lingerie'
  },
  'Jewelry': {
    'Rings': 'Rings',
    'Necklaces & Pendants': 'Necklaces_Pendants',
    'Earrings': 'Earrings',
    'Bracelets & Bangles': 'Bracelets_Bangles',
    'Watches': 'Watches',
    'Brooches & Pins': 'Brooches_Pins',
    'Anklets': 'Anklets',
    'Cufflinks': 'Cufflinks',
    'Tie Clips': 'Tie_Clips',
    'Jewelry Sets': 'Jewelry_Sets'
  }
};

const toKey = (label = '') => label
  .replace(/&/g, ' ')
  .replace(/'s/g, '') // Men's -> Men, Women's -> Women, Children's -> Children
  .replace(/[^A-Za-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '')
  .replace(/_{2,}/g, '_');

// ✅ Create a product (images are uploaded separately)
router.post("/", async (req, res) => {
  try {
    const {
      name,
      category,
      categoryKey,
      subcategory,
      subcategoryKey,
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
      tags = [],
      searchKeywords = [],
      useCases = [],
      images, // Array of Cloudinary URLs
    } = req.body;

    // Prevent creating products with Consumer Electronics category
    if (category === 'Consumer Electronics' || categoryKey === 'Consumer_Electronics') {
      return res.status(400).json({ 
        success: false, 
        message: 'Consumer Electronics category is no longer available. Please select Apparel & Accessories or Jewelry.' 
      });
    }

    // Import Manufacturer model
    const Manufacturer = (await import("../models/Manufacture.js")).default;
    const User = (await import("../models/User.js")).default;

    // Find or create manufacturer profile for the seller
    let manufacturer = await Manufacturer.findOne({ user: manufacturerId });
    if (!manufacturer) {
      // Get seller info to create manufacturer profile
      const seller = await User.findById(manufacturerId);
      if (!seller) {
        return res.status(400).json({ success: false, message: 'Seller not found' });
      }

      // Create basic manufacturer profile
      manufacturer = await Manufacturer.create({
        user: manufacturerId,
        companyName: seller.businessName || seller.name || 'Company Name',
        companyAddress: seller.companyAddress?.street || 'Address not provided',
        contactPerson: {
          name: seller.name || 'Contact Person',
          phone: seller.phone || '0000000000',
          email: seller.email || 'email@example.com'
        },
        gstin: seller.gstNumber || '',
        verified: false
      });
    }

    const product = new Product({
      name,
      category,
      categoryKey,
      subcategory,
      subcategoryKey,
      description,
      price,
      priceRange: { min: priceRangeMin, max: priceRangeMax },
      moq,
      sampleAvailable,
      samplePrice,
      manufacturerId,
      seller: manufacturerId, // Add seller field
      manufacturer: manufacturer._id, // Link to manufacturer profile
      images: images || [], // Cloudinary URLs
      videos: [], // No videos for now
      hsCode,
      warranty,
      returnPolicy,
      customization,
      tags: Array.isArray(tags) ? tags : [],
      searchKeywords: Array.isArray(searchKeywords) ? searchKeywords : [],
      useCases: Array.isArray(useCases) ? useCases : [],
    });
    await product.save();

    // Add product ID to manufacturer's products array
    await Manufacturer.findByIdAndUpdate(
      manufacturer._id,
      { $push: { products: product._id } },
      { new: true }
    );

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error creating product" });
  }
});


// ✅ List products by display labels (maps to normalized keys under the hood)
router.get("/by-labels", async (req, res) => {
  try {
    const { category, subcategory, page = 1, limit = 24, sort = "-createdAt" } = req.query;
    if (!category || !subcategory) {
      return res.status(400).json({ success: false, message: "category and subcategory are required" });
    }

    const categoryKey = CATEGORY_KEY_MAP[category] || toKey(category);
    const subcategoryKey = (SUBCATEGORY_KEY_MAP[category] && SUBCATEGORY_KEY_MAP[category][subcategory])
      ? SUBCATEGORY_KEY_MAP[category][subcategory]
      : toKey(subcategory);

    const skip = (Number(page) - 1) * Number(limit);
    const query = { categoryKey, subcategoryKey };

    const [items, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.json({ success: true, items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching products" });
  }
});

// ✅ List products by normalized keys using URL params (must come before query version)
router.get("/by-keys/:categoryKey/:subcategoryKey", async (req, res) => {
  try {
    const { categoryKey, subcategoryKey } = req.params;
    const { page = 1, limit = 24, sort = "-createdAt" } = req.query;
    if (!categoryKey || !subcategoryKey) {
      return res.status(400).json({ success: false, message: "categoryKey and subcategoryKey are required" });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const query = { categoryKey, subcategoryKey };

    const [items, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.json({ success: true, items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching products" });
  }
});

// ✅ List products by normalized keys using query params
router.get("/by-keys", async (req, res) => {
  try {
    const { categoryKey, subcategoryKey, page = 1, limit = 24, sort = "-createdAt" } = req.query;
    if (!categoryKey || !subcategoryKey) {
      return res.status(400).json({ success: false, message: "categoryKey and subcategoryKey are required" });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const query = { categoryKey, subcategoryKey };

    const [items, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.json({ success: true, items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching products" });
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

// ✅ Get product by ID with comprehensive seller and manufacturer information
router.get("/details/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Import models
    const User = (await import("../models/User.js")).default;
    const Manufacturer = (await import("../models/Manufacture.js")).default;
    
    const product = await Product.findById(id)
      .populate('seller', 'name email businessName phone createdAt')
      .populate({
        path: 'manufacturer',
        populate: {
          path: 'user',
          select: 'name email phone businessName'
        }
      });
    
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Get additional manufacturer products count
    let manufacturerProductsCount = 0;
    if (product.manufacturer) {
      manufacturerProductsCount = await Product.countDocuments({ 
        manufacturer: product.manufacturer._id 
      });
    }

    // Prepare response with comprehensive information
    const response = {
      success: true,
      product: {
        ...product.toObject(),
        manufacturerInfo: product.manufacturer ? {
          ...product.manufacturer.toObject(),
          totalProducts: manufacturerProductsCount,
          sellerSince: product.manufacturer.user?.createdAt
        } : null
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching product details" });
  }
});

// ✅ Get all products with manufacturer information for buyer dashboard
router.get("/all-with-manufacturers", async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    
    // Build query - exclude Consumer Electronics category
    let query = {};
    let sortCriteria = { createdAt: -1 };
    
    if (category) {
      // Ensure category is not Consumer Electronics
      if (category === 'Consumer Electronics') {
        return res.status(400).json({ success: false, message: 'Consumer Electronics category is no longer available' });
      }
      query.category = category;
    } else {
      // Exclude Consumer Electronics from general listings
      query.category = { $ne: 'Consumer Electronics' };
      query.categoryKey = { $ne: 'Consumer_Electronics' };
    }
    
    // Use MongoDB text search for better relevance when search term is provided
    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
      // Sort by textScore (relevance) when searching, then by createdAt
      sortCriteria = { score: { $meta: 'textScore' }, createdAt: -1 };
    }

    // Build find query with textScore projection when searching
    const findQuery = Product.find(query);
    if (search && search.trim()) {
      findQuery.select({ score: { $meta: 'textScore' } });
    }
    
    const products = await findQuery
      .populate('seller', 'name email businessName phone')
      .populate({
        path: 'manufacturer',
        select: 'companyName companyAddress contactPerson verified yearOfEstablishment'
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortCriteria);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching products" });
  }
});

export default router;