  import express from "express";
  import session from "express-session";
  import cors from "cors";
  import mongoose from "mongoose";
  import MongoStore from "connect-mongo";
  import dotenv from "dotenv";
  dotenv.config();

  import productRoutes from "./routes/productRoutes.js";
  import Product from "./models/Product.js"; // ✅ You forgot to import Product
  import Otp from "./models/Otp.js";
  import User from "./models/User.js";

  import { authMiddleware } from "./middleware/auth.js";

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  import cookieParser from "cookie-parser";
  app.use(cookieParser());

  mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

    

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  // Enable CORS
  app.use(cors({
    origin: 'http://localhost:5173', // frontend origin
    credentials: true
  }));

  // const allowedOrigins = ["http://localhost:5173"];


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

  // 1. Send OTP
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { phone } = req.body;

      if (!phone) return res.status(400).json({ message: "Phone Number is required" });

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Save OTP in DB (valid for 5 minutes)
      await Otp.create({
        phone,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      });

      // 👉 Here you’d integrate SMS provider like Twilio
      console.log(`OTP for ${phone}: ${otp}`);

      res.json({ message: "OTP sent" });
    } catch (err) {
      res.status(500).json({ message: "Error sending OTP", error: err.message });
    }
  });

  // 2. Verify OTP
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      console.log("🔔 Verify OTP request body:", req.body);
      const { phone, otp } = req.body;
      console.log("Received phone:", phone, "otp:", otp);

      const validOtp = await Otp.findOne({ phone, otp });
      console.log("OTP lookup result:", validOtp);

      if (!validOtp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }
      if (validOtp.expiresAt < new Date()) {
        return res.status(400).json({ message: "Expired OTP" });
      }

      let user = await User.findOne({ phone });
      if (!user) {
        user = await User.create({ phone });
      }

      req.session.userId = user._id;
      req.session.role = user.role;

      await Otp.deleteMany({ phone });

      res.json({ message: "Login successful", user });
    } catch (err) {
      console.error("❌ Verify OTP error:", err);   // print full error
      res.status(500).json({
        message: "Error verifying OTP",
        error: err.message,
        stack: err.stack,  // only in dev, remove in prod
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

  // app.use(cors({
  //   origin: function (origin, callback) {
  //     // Allow requests with no origin (like Postman blocked)
  //     if (!origin) return callback(new Error("Blocked: No origin"), false);

  //     if (allowedOrigins.includes(origin)) {
  //       callback(null, true);  // Allow frontend
  //     } else {
  //       callback(new Error("Blocked by CORS"), false); // Block others
  //     }
  //   },
  //   credentials: true
  // }));

  // app.use((req, res, next) => {
  //   const key = req.headers["x-api-key"];
  //   if (key === process.env.FRONTEND_SECRET_KEY) {
  //     next();
  //   } else {
  //     res.status(403).json({ error: "Forbidden" });
  //   }
  // });
  app.get("/api/addData", async (req, res) => {
    let productData = [
    {
      "name": "Cotton Saree",
      "category": "Textile",
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
      "category": "Textile",
      "description": "Rich Banarasi silk saree with zari work.",
      "price": 5500,
      "priceRange": { "min": 5000, "max": 6000 },
      "moq": 5,
      "sampleAvailable": false,
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
      "category": "Jewellery",
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
      "category": "Jewellery",
      "description": "Handcrafted oxidized silver earrings for ethnic wear.",
      "price": 600,
      "priceRange": { "min": 500, "max": 800 },
      "moq": 30,
      "sampleAvailable": false,
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
      "category": "Handicraft & Home Decor",
      "description": "Handcrafted teak wood wall clock with intricate carvings.",
      "price": 2200,
      "priceRange": { "min": 2000, "max": 2500 },
      "moq": 10,
      "sampleAvailable": false,
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
      "category": "Handicraft & Home Decor",
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
      "category": "Textile",
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
      "category": "Jewellery",
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
      "category": "Handicraft & Home Decor",
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
      "category": "Handicraft & Home Decor",
      "description": "Polished brass lamp with antique finish for home decor.",
      "price": 3500,
      "priceRange": { "min": 3000, "max": 4000 },
      "moq": 8,
      "sampleAvailable": false,
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
      "category": "Textile",
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
      "category": "Jewellery",
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
      "category": "Jewellery",
      "description": "Handcrafted silver anklet with ghungroo bells.",
      "price": 2000,
      "priceRange": { "min": 1800, "max": 2200 },
      "moq": 10,
      "sampleAvailable": false,
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
      "category": "Handicraft & Home Decor",
      "description": "Wooden jewelry storage box with Rajasthani hand-painting.",
      "price": 1800,
      "priceRange": { "min": 1500, "max": 2000 },
      "moq": 20,
      "sampleAvailable": true,
      "samplePrice": 250,
      "manufacturerId": "64f0a1b2c3d4e5f678901234",
      "images": ["https://s.alicdn.com/@sc04/kf/U67bc610911064345bd32523f897bce29b.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/U58b9b76c4d0841e99451159ea776a579M.jpg?avif=close&webp=close",
        "https://s.alicdn.com/@sc04/kf/U83694bd2b2ac47c9b5a4b1025e13893ay.jpg?avif=close&webp=close",
      ],
      "videos": [],
      "hsCode": "442090",
      "warranty": "2 years",
      "returnPolicy": "7 days return",
      "customization": true
    },
    {
      "name": "Wool Pashmina Shawl",
      "category": "Textile",
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
      "category": "Jewellery",
      "description": "Premium Jadau earrings with ruby and pearl detailing.",
      "price": 12000,
      "priceRange": { "min": 11000, "max": 13000 },
      "moq": 2,
      "sampleAvailable": false,
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
      "category": "Handicraft & Home Decor",
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
      "category": "Textile",
      "description": "Banarasi silk dupatta with intricate zari border.",
      "price": 2200,
      "priceRange": { "min": 2000, "max": 2500 },
      "moq": 15,
      "sampleAvailable": false,
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
      "category": "Handicraft & Home Decor",
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

      // Bulk insert all products
      await Product.insertMany(productData);

      res.json({ message: "Products added successfully!!!!!!!!!!!11" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }

  });

  // to check backend is running or not
  app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
  });


  // In homepage, show All products
  app.get("/api/showAllProducts", async (req, res) => {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });


  // Get product by ID
  app.get('/api/product/:id', async (req, res) => {
    const { id } = req.params;
    console.log(id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    try {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json(product);
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // app.use("/api/products", productRoutes);
