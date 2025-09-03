const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
import productRoutes from "./routes/productRoutes.js";

const app = express();

const allowedOrigins = ["http://localhost:5173"];

app.use(cors());

import cookieParser from "cookie-parser";
app.use(cookieParser());



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

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 3000;
const mongodb_url = process.env.MONGO_URL;

mongoose.connect(mongodb_url).then(() => {
  console.log("Connected to MongoDB!");
  app.listen(PORT, () => console.log(`App is running on port ${PORT}`));
})
  .catch((err) => console.error("MongoDB connection error:", err));7



