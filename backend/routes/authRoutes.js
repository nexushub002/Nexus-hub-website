// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// const router = express.Router();

// // ✅ Register
// router.post("/user-register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = new User({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     await user.save();

//     res.status(201).json({ success: true, user });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ✅ Login
// router.post("/user-login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//      // 1. Find user
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ success: false, message: "User not found" });
    
//     // 2. Check password (assuming bcrypt)
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });
    
//     // 3. Sign JWT
//     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });
    

//     // 4. Set JWT in secure cookie
//   res.cookie("token", token, {
//     httpOnly: true,       // ❌ not accessible by JS
//     secure: process.env.NODE_ENV === "production", // ✅ only https in prod
//     sameSite: "strict",   // ✅ CSRF protection
//     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//   });


//     res.json({ success: true, token, role: user.role });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });


// router.post("/logout", (req, res) => {
//   res.clearCookie("token", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//   });
//   res.status(200).json({ success: true, message: "Logged out successfully" });
// });

// export default router;