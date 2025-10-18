  import express from "express";
  import session from "express-session";
  import cors from "cors";
  import mongoose from "mongoose";
  import MongoStore from "connect-mongo";
  import dotenv from "dotenv";
  import axios from "axios";
  dotenv.config();

  import productRoutes from "./routes/productRoutes.js";
  import uploadRoutes from "./routes/uploadRoutes.js";
  import wishlistRoutes from "./routes/wishlistRoutes.js";
  import cartRoutes from "./routes/cartRoutes.js";
  import sellerProductRoutes from "./routes/sellerProductRoutes.js";
  import sellerOrderRoutes from "./routes/sellerOrderRoutes.js";
  import orderRoutes from "./routes/orderRoutes.js";
  import inquiryRoutes from "./routes/inquiries.js";
  import Product from "./models/Product.js"; // ✅ You forgot to import Product
  import Otp from "./models/Otp.js";
  import User from "./models/User.js";
  import Seller from "./models/SellerProfile.js";
  import Wishlist from "./models/Wishlist.js";
  import Cart from "./models/Cart.js";

 

  // Import middleware
  import { authMiddleware } from "./middleware/auth.js";

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  import cookieParser from "cookie-parser";
  app.use(cookieParser());

  mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

    

  // Enable CORS
  app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://nexus-hub-fronted.vercel.app", "https://sellernexus-hub.vercel.app"], // frontend + seller frontend
    credentials: true
  }));


  // ✅ Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || "nexushub_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL, // your MongoDB connection
      ttl: 60 * 60 * 24 * 7 // 7 days (in seconds)
    }),
    cookie: {
      httpOnly: true,
      secure: false,   // ❌ false for localhost, ✅ true for production (HTTPS)
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  }));

  // Function to send SMS using Fast2SMS (Free service)
  const sendSMS = async (phone, otp) => {
    try {
      // Fast2SMS API configuration
      const apiKey = process.env.FAST2SMS_API_KEY || "YOUR_FAST2SMS_API_KEY"; // Add this to your .env file
      const message = `Your NexusHub verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`;
      
      // If no API key is provided, just log the OTP (for development)
      if (!process.env.FAST2SMS_API_KEY || apiKey === "YOUR_FAST2SMS_API_KEY") {
        console.log(`🔐 OTP for ${phone}: ${otp} (Valid for 5 minutes)`);
        console.log(`📱 SMS Message: ${message}`);
        return { success: true, message: "OTP logged to console (development mode)" };
      }

      // Send actual SMS using Fast2SMS
      const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
        route: 'v3',
        sender_id: 'TXTIND',
        message: message,
        language: 'english',
        flash: 0,
        numbers: phone
      }, {
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.return) {
        return { success: true, message: "OTP sent successfully" };
      } else {
        throw new Error(response.data.message || "Failed to send SMS");
      }
    } catch (error) {
      console.error("❌ SMS sending error:", error.message);
      // Fallback to console logging if SMS fails
      console.log(`🔐 Fallback - OTP for ${phone}: ${otp} (Valid for 5 minutes)`);
      return { success: true, message: "OTP logged to console (SMS service unavailable)" };
    }
  };

  // 1. Send OTP
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { phone } = req.body;

      if (!phone) return res.status(400).json({ message: "Phone Number is required" });

      // Validate phone number format (10 digits starting with 6-9)
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: "Please enter a valid 10-digit mobile number" });
      }

      // Delete any existing OTPs for this phone number
      await Otp.deleteMany({ phone });

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Save OTP in DB (valid for 5 minutes)
      await Otp.create({
        phone,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      });

      // Send SMS using Fast2SMS or fallback to console
      const smsResult = await sendSMS(phone, otp);
      
      res.json({ 
        message: smsResult.message,
        success: true 
      });
    } catch (err) {
      console.error("❌ Send OTP error:", err);
      res.status(500).json({ message: "Error sending OTP", error: err.message });
    }
  });

  // 2. Verify OTP
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      console.log("🔔 Verify OTP request body:", req.body);
      const { phone, otp } = req.body;

      if (!phone || !otp) {
        return res.status(400).json({ message: "Phone number and OTP are required" });
      }

      // Validate phone number format
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: "Invalid phone number format" });
      }

      // Validate OTP format (6 digits)
      const otpRegex = /^\d{6}$/;
      if (!otpRegex.test(otp)) {
        return res.status(400).json({ message: "OTP must be 6 digits" });
      }

      console.log("Received phone:", phone, "otp:", otp);

      const validOtp = await Otp.findOne({ phone, otp });
      console.log("OTP lookup result:", validOtp);

      if (!validOtp) {
        return res.status(400).json({ message: "Invalid OTP. Please check and try again." });
      }
      
      if (validOtp.expiresAt < new Date()) {
        // Clean up expired OTP
        await Otp.deleteMany({ phone });
        return res.status(400).json({ message: "OTP has expired. Please request a new one." });
      }

      let user = await User.findOne({ phone });
      if (!user) {
        user = await User.create({ phone });
      }

      req.session.userId = user._id;
      req.session.role = user.role;

      // Clean up used OTP
      await Otp.deleteMany({ phone });

      res.json({ message: "Login successful", user });
    } catch (err) {
      console.error("❌ Verify OTP error:", err);
      res.status(500).json({
        message: "Error verifying OTP",
        error: err.message
      });
    }
  });

  // Get current user (session)
  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });

      const user = await User.findById(req.session.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({ user });
    } catch (err) {
      res.status(500).json({ message: "Error getting user info", error: err.message });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out", error: err.message });
      }
      res.json({ message: "Logout successful" });
    });
  });


   // Import routes
  import sellerAuthRoutes from "./routes/sellerAuthRoutes.js";
  import sellerProfileRoutes from "./routes/sellerProfileRoutes.js";
  import newProductRoutes from "./routes/newProductRoutes.js";

  //use seller routes
  app.use("/api/seller/auth", sellerAuthRoutes);
  
  // New seller profile routes (using SellerProfile schema)
  app.use("/api/seller-profile", sellerProfileRoutes);
  app.use("/api/products-new", newProductRoutes);


  
  app.get("/api/addData", async (req, res) => {
    // Mapping from display labels to normalized keys
    const CATEGORY_KEY_MAP = {
      'Apparel & Accessories': 'Apparel_Accessories',
      'Consumer Electronics': 'Consumer_Electronics',
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
      'Consumer Electronics': {
        'Mobile Phones & Accessories': 'Mobile_Phones_Accessories',
        'Computers & Laptops': 'Computers_Laptops',
        'Audio & Video Equipment': 'Audio_Video_Equipment',
        'Gaming Consoles & Accessories': 'Gaming_Consoles_Accessories',
        'Cameras & Photography': 'Cameras_Photography',
        'Home Appliances': 'Home_Appliances',
        'Smart Home Devices': 'Smart_Home_Devices',
        'Wearable Technology': 'Wearable_Technology',
        'Electronic Components': 'Electronic_Components',
        'Office Electronics': 'Office_Electronics'
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
      .replace(/[^A-Za-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/_{2,}/g, '_');
    let productData = [
    {
      "name": "Cotton Saree",
      "category": "Apparel & Accessories",
      "subcategory": "Women's Clothing",
      "categoryKey": "Apparel_Accessories",
      "subcategoryKey": "Women_Clothing",
      "description": "Lightweight cotton saree with traditional hand block prints.",
      "price": 1200,
      "priceRange": { "min": 1000, "max": 1500 },
      "moq": 10,
      "sampleAvailable": true,
      "samplePrice": 150,
      "manufacturerId": "64f0a1b2c3d4e5f678901234",
      "images": ["https://s.alicdn.com/@sc04/kf/Acc617036cc1748fa97d7e0d361800511s.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/A4b83cde3269d47dc87ad12c7008cf932f.jpg?avif=close&webp=close",
      "https://s.alicdn.com/@sc04/kf/A4b83cde3269d47dc87ad12c7008cf932f.jpg?avif=close&webp=close",
      "https://s.alicdn.com/@sc04/kf/A217c3aa8b5ea408fac368cb1a0b302a9g.jpg?avif=close&webp=close",
    "https://s.alicdn.com/@sc04/kf/Ad0b3bb071ac447a58feb61ffda7fbb597.jpg?avif=close&webp=close"],
      "videos": [],
      "hsCode": "520819",
      "warranty": "6 months",
      "returnPolicy": "7 days return",
      "customization": true
    },
    {
      "name": "Banarasi Silk Saree",
      "category": "Apparel & Accessories",
      "subcategory": "Women's Clothing",
      "categoryKey": "Apparel_Accessories",
      "subcategoryKey": "Women_Clothing",
      "description": "Rich Banarasi silk saree with zari work.",
      "price": 5500,
      "priceRange": { "min": 5000, "max": 6000 },
      "moq": 5,
      "sampleAvailable": false,
      "samplePrice": 150,
      "manufacturerId": "64f0a1b2c3d4e5f678901234",
      "images": ["https://s.alicdn.com/@sc04/kf/Af7844a0deecf40e985b18a7a755582e9a.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/Afa830fb50146403a9c2d7d287baf74a00.jpeg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/A98a6da4ac05a4eb2b044e2967a868f10T.jpeg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/A3578fb042d7b489a8994cb461e87d4a40.jpeg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/A98f26b8cd34a47d4a440f621dbf3f7e2O.jpeg?avif=close&webp=close",
      ],
      "videos": [],
      "hsCode": "500720",
      "warranty": "1 year",
      "returnPolicy": "10 days return",
      "customization": true
    },
    {
      "name": "Kundan Necklace Set",
      "category": "Jewelry",
      "subcategory": "Necklaces & Pendants",
      "categoryKey": "Jewelry",
      "subcategoryKey": "Necklaces_Pendants",
      "description": "Traditional Kundan necklace with matching earrings.",
      "price": 8000,
      "priceRange": { "min": 7000, "max": 9000 },
      "moq": 2,
      "sampleAvailable": true,
      "samplePrice": 1000,
      "manufacturerId": "64f0a1b2c3d4e5f678901234",
      "images": ["https://s.alicdn.com/@sc04/kf/Aa73b56549c704e0483c03c7217831fdfL.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/Ae62ab9b8f9b241fabed6122052c4a1ceF.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/Ae69e196b85d7417ebbf86628ddb20df0F.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/Ad25d1fa5619c4ff2bca28c6a2e8408467.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/Af85ef5de637b4ba1ad3425dd2e7fbecdK.jpg?avif=close&webp=close"
      ],
      "videos": [],
      "hsCode": "711319",
      "warranty": "2 years",
      "returnPolicy": "15 days return",
      "customization": true
    },
    {
      "name": "Silver Oxidized Earrings",
      "category": "Jewelry",
      "subcategory": "Earrings",
      "categoryKey": "Jewelry",
      "subcategoryKey": "Earrings",
      "description": "Handcrafted oxidized silver earrings for ethnic wear.",
      "price": 600,
      "priceRange": { "min": 500, "max": 800 },
      "moq": 30,
      "sampleAvailable": false,
      "samplePrice": 100,
      "manufacturerId": "64f0a1b2c3d4e5f678901234",
      "images": ["https://s.alicdn.com/@sc04/kf/H08f14f5c642f42c58325f6f9c560769ei.png?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/Hc9d9bb2afca64b6ebef92aab0d645479E.png?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/He794c653cd47429cbcd64c07281c241ex.png?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/H6c5adb94b24a49059aeaa5101a608b1bn.png?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/H08f14f5c642f42c58325f6f9c560769ei.png?avif=close&webp=close"
      ],
      "videos": [],
      "hsCode": "711311",
      "warranty": "1 year",
      "returnPolicy": "7 days return",
      "customization": false
    },
    {
      "name": "Wooden Carved Wall Clock",
      "category": "Consumer Electronics",
      "subcategory": "Mobile Phones & Accessories",
      "categoryKey": "Consumer_Electronics",
      "subcategoryKey": "Mobile_Phones_Accessories",
      "description": "Handcrafted teak wood wall clock with intricate carvings.",
      "price": 2200,
      "priceRange": { "min": 2000, "max": 2500 },
      "moq": 10,
      "sampleAvailable": false,
      "samplePrice": 2000,
      "manufacturerId": "64f0a1b2c3d4e5f678901234",
      "images": ["https://s.alicdn.com/@sc04/kf/A3332cd504e074f9da77d01dfe30f637aR.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/A970e843b680e446a93ab273c131f21f8L.png?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/A3332cd504e074f9da77d01dfe30f637aR.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/A3f42791b93e84fb6b24848979b9d6b58d.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/A92c96bf368264cdd86ebb6a364bfdcc2n.jpg?avif=close&webp=close"
      ],
      "videos": [],
      "hsCode": "910310",
      "warranty": "2 years",
      "returnPolicy": "7 days replacement",
      "customization": true
    },
    {
      "name": "Rajasthani Blue Pottery Vase",
      "category": "Consumer Electronics",
      "subcategory": "Mobile Phones & Accessories",
      "categoryKey": "Consumer_Electronics",
      "subcategoryKey": "Mobile_Phones_Accessories",
      "description": "Traditional blue pottery flower vase made in Jaipur.",
      "price": 1500,
      "priceRange": { "min": 1200, "max": 1800 },
      "moq": 15,
      "sampleAvailable": true,
      "samplePrice": 200,
      "manufacturerId": "64f0a1b2c3d4e5f678901234",
      "images": ["https://s.alicdn.com/@sc04/kf/H187410eaa221404da6400deaace7a76av.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/Hf1e1a134fb5143a28b1091de12c3afc2v.jpg?avif=close&webp=close"
      ],
      "videos": [],
      "hsCode": "691200",
      "warranty": "N/A",
      "returnPolicy": "No return",
      "customization": false
    },
    {
      "name": "Chanderi Dupatta",
      "category": "Apparel & Accessories",
      "subcategory": "Women's Clothing",
      "categoryKey": "Apparel_Accessories",
      "subcategoryKey": "Women_Clothing",
      "description": "Lightweight Chanderi silk dupatta with golden zari border.",
      "price": 900,
      "priceRange": { "min": 800, "max": 1200 },
      "moq": 25,
      "sampleAvailable": true,
      "samplePrice": 120,
      "manufacturerId": "64f0a1b2c3d4e5f678901234",
      "images": ["https://s.alicdn.com/@sc04/kf/Aeca28db9b7fd43adb34a7bbe7a62050bV.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/A81ade45fa503410687888773a672fd28k.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/A2b24012816d54ce8943a8e411c7302844.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/Ac5244d3f687545a0b42bc6c804083799E.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/Af965f8d615ce4e1d8d7c5f2a9b8d763fE.jpg?avif=close&webp=close"
      ],
      "videos": [],
      "hsCode": "500720",
      "warranty": "6 months",
      "returnPolicy": "7 days return",
      "customization": true
    },
    {
      "name": "Meenakari Bangles",
      "category": "Jewelry",
      "subcategory": "Necklaces & Pendants",
      "categoryKey": "Jewelry",
      "subcategoryKey": "Necklaces_Pendants",
      "description": "Hand-painted Meenakari bangles in vibrant colors.",
      "price": 1200,
      "priceRange": { "min": 1000, "max": 1500 },
      "moq": 20,
      "sampleAvailable": false,
      "manufacturerId": "64f0a1b2c3d4e5f678901234",
      "images": ["https://s.alicdn.com/@sc04/kf/Adccec0f8047a4bd48694aa981c05855cO.jpg?avif=close&webp=close"],
      "videos": [],
      "hsCode": "711411",
      "warranty": "1 year",
      "returnPolicy": "7 days return",
      "customization": true
    },
    {
      "name": "Handmade Woolen Carpet",
      "category": "Consumer Electronics",
      "subcategory": "Mobile Phones & Accessories",
      "categoryKey": "Consumer_Electronics",
      "subcategoryKey": "Mobile_Phones_Accessories",
      "description": "Luxurious hand-knotted woolen carpet from Kashmir.",
      "price": 15000,
      "priceRange": { "min": 12000, "max": 18000 },
      "moq": 2,
      "sampleAvailable": true,
      "samplePrice": 2000,
      "manufacturerId": "64f0a1b2c3d4e5f678901234",
      "images": ["https://s.alicdn.com/@sc04/kf/Hb67307eb32f94b688e744683e67340ceh.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/H218a075e094b4e0d9fdc745a1b9cdc19P.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/H0631268bd7024e1faa69f0266a32cf87m.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/H1c5e71bdf6d24a2880db3032af9afc9bl.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/H95674f4ee3b447558c0cfdf57dcae68cF.jpg?avif=close&webp=close"
      ],
      "videos": [],
      "hsCode": "570110",
      "warranty": "5 years",
      "returnPolicy": "15 days return",
      "customization": true
    },
    {
      "name": "Brass Decorative Lamp",
      "category": "Consumer Electronics",
      "subcategory": "Mobile Phones & Accessories",
      "categoryKey": "Consumer_Electronics",
      "subcategoryKey": "Mobile_Phones_Accessories",
      "description": "Polished brass lamp with antique finish for home decor.",
      "price": 3500,
      "priceRange": { "min": 3000, "max": 4000 },
      "moq": 8,
      "sampleAvailable": false,
      "samplePrice": 1000,
      "manufacturerId": "64f0a1b2c3d4e5f678901234",
      "images": ["https://s.alicdn.com/@sc04/kf/H1aa402d5330a4b338ab522cab379ebfbi.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/H826fa89b510940aa9d51c0b63e2ab445k.png?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/H48cc5f167d8b47d99b8989411c0426cd3.png?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/H339fa900ae204c7a97baeb0ac5b9321fw.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/Hf5164ef197404a1e8cf0189dec7c2ca3S.jpg?avif=close&webp=close"
      ],
      "videos": [],
      "hsCode": "940520",
      "warranty": "2 years",
      "returnPolicy": "7 days replacement",
      "customization": false
    },
    {
      "name": "Handloom Cotton Kurta Fabric",
      "category": "Apparel & Accessories",
      "subcategory": "Men's Clothing",
      "categoryKey": "Apparel_Accessories",
      "subcategoryKey": "Men_Clothing",
      "description": "Handwoven cotton fabric suitable for kurta stitching.",
      "price": 400,
      "priceRange": { "min": 350, "max": 500 },
      "moq": 50,
      "sampleAvailable": true,
      "samplePrice": 60,
      "manufacturerId": "64f0a1b2c3d4e5f678901234",
      "images": ["https://s.alicdn.com/@sc04/kf/Abbce345d0af54bfcb994ebbadbe235af5.jpeg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/A63361468b6a347aa971b38f3eee8863bK.jpeg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/A9f8aac64522c4f97b1489888b01f6191D.jpeg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/Af334bb4f7d08413b8020bd47ea526c2aM.jpeg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/Ac4bb75bbf6114d8ab65298618810114ew.jpeg?avif=close&webp=close"
      ],
      "videos": [],
      "hsCode": "520819",
      "warranty": "N/A",
      "returnPolicy": "No return",
      "customization": false
    },
    {
      "name": "Temple Jewellery Set",
      "category": "Jewelry",
      "subcategory": "Necklaces & Pendants",
      "categoryKey": "Jewelry",
      "subcategoryKey": "Necklaces_Pendants",
      "description": "Traditional temple jewellery set with intricate motifs.",
      "price": 9500,
      "priceRange": { "min": 9000, "max": 10000 },
      "moq": 3,
      "sampleAvailable": true,
      "samplePrice": 1200,
      "manufacturerId": "64f0a1b2c3d4e5f678901234",
      "images": ["https://s.alicdn.com/@sc04/kf/H55fc955a7c7549b2b09b8b0a1d2fed42R.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/Hb750220029a64387b236816bd32e6854x.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/H5b93a18f04e840f68941b7512b4a1c32L.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/Hae91a6a5050c4fdb99dad16b270cf0fb4.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/H6b54762f50004e9ba0f49bb7478a618as.jpg?avif=close&webp=close"
      ],
      "videos": [],
      "hsCode": "711319",
      "warranty": "3 years",
      "returnPolicy": "15 days return",
      "customization": true
    },
    {
      "name": "Silver Payal (Anklet)",
      "category": "Jewelry",
      "subcategory": "Necklaces & Pendants",
      "categoryKey": "Jewelry",
      "subcategoryKey": "Necklaces_Pendants",
      "description": "Handcrafted silver anklet with ghungroo bells.",
      "price": 2000,
      "priceRange": { "min": 1800, "max": 2200 },
      "moq": 10,
      "sampleAvailable": false,
      "samplePrice": 250,
      "manufacturerId": "64f0a1b2c3d4e5f678901234",
      "images": ["https://s.alicdn.com/@sc04/kf/Hb152721f5027457a8e97d0155a49281ed.jpg?avif=close&webp=close"],
      "videos": [],
      "hsCode": "711311",
      "warranty": "1 year",
      "returnPolicy": "7 days return",
      "customization": true
    },
    {
      "name": "Hand-painted Wooden Jewelry Box",
      "category": "Consumer Electronics",
      "subcategory": "Mobile Phones & Accessories",
      "categoryKey": "Consumer_Electronics",
      "subcategoryKey": "Mobile_Phones_Accessories",
      "description": "Wooden jewelry storage box with Rajasthani hand-painting.",
      "price": 1800,
      "priceRange": { "min": 1500, "max": 2000 },
      "moq": 20,
      "sampleAvailable": true,
      "samplePrice": 250,
      "manufacturerId": "64f0a1b2c3d4e5f678901234",
      "images": ["https://s.alicdn.com/@sc04/kf/U67bc610911064345bd32523f897bce29b.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/U58b9b76c4d0841e99451159ea776a579M.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/U83694bd2b2ac47c9b5a4b1025e13893ay.jpg?avif=close&webp=close"
      ],
      "videos": [],
      "hsCode": "442090",
      "warranty": "2 years",
      "returnPolicy": "7 days return",
      "customization": true
    },
    {
      "name": "Wool Pashmina Shawl",
      "category": "Apparel & Accessories",
      "subcategory": "Women's Clothing",
      "categoryKey": "Apparel_Accessories",
      "subcategoryKey": "Women_Clothing",
      "description": "Soft and warm Kashmiri pashmina wool shawl.",
      "price": 4000,
      "priceRange": { "min": 3500, "max": 4500 },
      "moq": 5,
      "sampleAvailable": true,
      "samplePrice": 600,
      "manufacturerId": "64f0a1b2c3d4e5f678901234",
      "images": ["https://s.alicdn.com/@sc04/kf/Aca3de6b1f9dd4480b75f37fb002ce0d1h.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/A852e862e6b3341d0877bf7643c7e2166i.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/A16dcdb5c08414b408bbef30ea092a133a.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/A30c4c71c5c6c43eaa1cfb976ae86d457q.jpg?avif=close&webp=close"
      ],
      "videos": [],
      "hsCode": "621420",
      "warranty": "N/A",
      "returnPolicy": "10 days return",
      "customization": true
    },
    {
      "name": "Jadau Earrings",
      "category": "Jewelry",
      "subcategory": "Necklaces & Pendants",
      "categoryKey": "Jewelry",
      "subcategoryKey": "Necklaces_Pendants",
      "description": "Premium Jadau earrings with ruby and pearl detailing.",
      "price": 12000,
      "priceRange": { "min": 11000, "max": 13000 },
      "moq": 2,
      "sampleAvailable": false,
      "samplePrice": 1200,
      "manufacturerId": "64f0a1b2c3d4e5f678901234",
      "images": ["https://s.alicdn.com/@sc04/kf/Ab02b00cff3ce4b1188bc591242fa69dfa.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/Ab02b00cff3ce4b1188bc591242fa69dfa.jpg?avif=close&webp=close"
      ],
      "videos": [],
      "hsCode": "711319",
      "warranty": "3 years",
      "returnPolicy": "15 days return",
      "customization": false
    },
    {
      "name": "Handwoven Jute Basket",
      "category": "Consumer Electronics",
      "subcategory": "Mobile Phones & Accessories",
      "categoryKey": "Consumer_Electronics",
      "subcategoryKey": "Mobile_Phones_Accessories",
      "description": "Eco-friendly jute basket handwoven by artisans.",
      "price": 700,
      "priceRange": { "min": 600, "max": 900 },
      "moq": 50,
      "sampleAvailable": true,
      "samplePrice": 100,
      "manufacturerId": "64f0a1b2c3d4e5f678901234",
      "images": ["https://s.alicdn.com/@sc04/kf/A059d4510585f4faf93a6ecd089dd410bF.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/A69b6941a0972420ba0e9eafed8270ae8E.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/A3f8d93e8c2c445f6b08bf9639a8e079bz.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/A6ad683de268742c69f85e0df04b7d4d7a.jpg?avif=close&webp=close"
      ],
      "videos": [],
      "hsCode": "460219",
      "warranty": "1 year",
      "returnPolicy": "No return",
      "customization": true
    },
    {
      "name": "Banarasi Dupatta",
      "category": "Apparel & Accessories",
      "subcategory": "Women's Clothing",
      "categoryKey": "Apparel_Accessories",
      "subcategoryKey": "Women_Clothing",
      "description": "Banarasi silk dupatta with intricate zari border.",
      "price": 2200,
      "priceRange": { "min": 2000, "max": 2500 },
      "moq": 15,
      "sampleAvailable": false,
      "samplePrice": 250,
      "manufacturerId": "64f0a1b2c3d4e5f678901234",
      "images": ["https://s.alicdn.com/@sc04/kf/H85edb74286e74217bdbc83f6e3752398U.jpg?avif=close&webp=close"],
      "videos": [],
      "hsCode": "500720",
      "warranty": "1 year",
      "returnPolicy": "7 days return",
      "customization": true
    },
    {
      "name": "Brass Wall Hanging Ganesha",
      "category": "Consumer Electronics",
      "subcategory": "Mobile Phones & Accessories",
      "categoryKey": "Consumer_Electronics",
      "subcategoryKey": "Mobile_Phones_Accessories",
      "description": "Handcrafted brass Ganesha wall hanging for pooja rooms.",
      "price": 2800,
      "priceRange": { "min": 2500, "max": 3200 },
      "moq": 10,
      "sampleAvailable": true,
      "samplePrice": 400,
      "manufacturerId": "64f0a1b2c3d4e5f678901234",
      "images": ["https://s.alicdn.com/@sc04/kf/A950c61667e7d49009b037b44656508eeu.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/Adc238993a70c4677bc98debf2ff29a23F.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/A950c61667e7d49009b037b44656508eeu.jpg?avif=close&webp=close"
      ],
      "videos": [],
      "hsCode": "830629",
      "warranty": "N/A",
      "returnPolicy": "No return",
      "customization": false
    }
  ];
  
  try {
      // Optional: Clear the existing products first
      await Product.deleteMany({});

      // Compute normalized keys and bulk insert
      const augmented = productData.map((p) => {
        const categoryKey = CATEGORY_KEY_MAP[p.category] || toKey(p.category);
        const subcategoryKey = (SUBCATEGORY_KEY_MAP[p.category] && SUBCATEGORY_KEY_MAP[p.category][p.subcategory])
          ? SUBCATEGORY_KEY_MAP[p.category][p.subcategory]
          : toKey(p.subcategory);
        
        return {
          ...p,
          categoryKey,
          subcategoryKey
        };
      });
      
      console.log("=== DEBUG: Sample augmented product ===");
      console.log("Category:", augmented[0].category);
      console.log("Subcategory:", augmented[0].subcategory);
      console.log("CategoryKey:", augmented[0].categoryKey);
      console.log("SubcategoryKey:", augmented[0].subcategoryKey);
      console.log("==========================================");
      
      await Product.insertMany(augmented);

      res.json({ 
        message: "Products added successfully - " + new Date().toISOString(),
        count: augmented.length,
        sampleKeys: {
          categoryKey: augmented[0].categoryKey,
          subcategoryKey: augmented[0].subcategoryKey
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }

  });

  // to check backend is running or not
  app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
  });

  app.get("/api/search", async (req, res) => {
  try {
    const q = req.query.q?.toLowerCase() || "";
    const limit = parseInt(req.query.limit) || 0; // 0 means no limit

    if (!q) {
      return res.status(400).json({ message: "Query is required" });
    }

    let query = Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },          // case-insensitive name match
        { description: { $regex: q, $options: "i" } },   // case-insensitive description match
        { category: { $regex: q, $options: "i" } }       // case-insensitive category match
      ]
    });

    if (limit > 0) {
      query = query.limit(limit);
    }

    const products = await query;

    res.json(products);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


  // Create product (JSON only, images as URLs). Associates manufacturerId as seller.
  app.post('/api/products', async (req, res) => {
    try {
      const {
        name,
        category,
        subcategory,
        categoryKey,
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
        images = [],
        videos = []
      } = req.body

      // Find or create seller profile for the seller
      let sellerProfile = await Seller.findOne({ email: manufacturerId });
      if (!sellerProfile) {
        // Get seller info to create seller profile
        const seller = await User.findById(manufacturerId);
        if (!seller) {
          return res.status(400).json({ success: false, message: 'Seller not found' });
        }

        // Create basic seller profile
        sellerProfile = await Seller.create({
          sellerId: `NXS${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          name: seller.name || 'Seller Name',
          email: seller.email,
          phone: seller.phone || '0000000000',
          password: 'temp-password', // This should be properly handled
          companyName: seller.businessName || seller.name || 'Company Name',
          companyAddress: seller.companyAddress?.street || 'Address not provided',
          contactPerson: {
            name: seller.name || 'Contact Person',
            phone: seller.phone || '0000000000',
            email: seller.email || 'email@example.com'
          },
          gstNumber: seller.gstNumber || 'TEMP-GST',
          verified: false,
          products: []
        });
      }

      const product = await Product.create({
        name,
        category,
        subcategory,
        categoryKey,
        subcategoryKey,
        description,
        price,
        priceRange: { min: priceRangeMin, max: priceRangeMax },
        moq,
        sampleAvailable,
        samplePrice,
        sellerId: sellerProfile.sellerId, // Use seller's unique ID
        sellerProfile: sellerProfile._id, // Link to seller profile
        hsCode,
        warranty,
        returnPolicy,
        customization,
        images,
        videos
      })

      // Add product ID to seller's products array
      await Seller.findByIdAndUpdate(
        sellerProfile._id,
        { $push: { products: product._id } },
        { new: true }
      );

      res.status(201).json({ success: true, product })
    } catch (err) {
      res.status(400).json({ success: false, message: err.message })
    }
  })

  // In homepage, show All products with seller information
  app.get("/api/showAllProducts", async (req, res) => {
    try {
      const products = await Product.find()
        .populate({
          path: 'sellerProfile',
          select: 'sellerId companyName companyAddress contactPerson verified yearOfEstablishment companyLogo'
        })
        .sort({ createdAt: -1 });
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });




  // Get product by ID with manufacturer information
  app.get('/api/product/:id', async (req, res) => {
    const { id } = req.params;
    console.log(id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    try {
      const product = await Product.findById(id)
        .populate({
          path: 'sellerProfile',
          select: 'sellerId companyName companyAddress contactPerson verified yearOfEstablishment companyLogo aboutCompany website'
        });
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Get seller's total products count
      let sellerProductsCount = 0;
      if (product.sellerProfile) {
        sellerProductsCount = await Product.countDocuments({ 
          sellerProfile: product.sellerProfile._id 
        });
      }

      // Enhanced response with seller info
      const response = {
        ...product.toObject(),
        sellerInfo: product.sellerProfile ? {
          ...product.sellerProfile.toObject(),
          totalProducts: sellerProductsCount,
          sellerSince: product.sellerProfile.createdAt
        } : null
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.use("/api/products", productRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api/wishlist", wishlistRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/seller/products", sellerProductRoutes);
  app.use("/api/seller/orders", sellerOrderRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/inquiries", inquiryRoutes);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
