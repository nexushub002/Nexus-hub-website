import express from "express";
import User from "../models/User.js";
import { verifySeller } from "../middleware/sellerAuth.js";

const router = express.Router();

// ----------------------
// GET PROFILE
// ----------------------
router.get("/me", verifySeller, async (req, res) => {
  try {
    // verifySeller populates req.user
    return res.json({ user: req.user });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching user info" });
  }
});

// ----------------------
// UPDATE PROFILE
// ----------------------
router.put("/profile", verifySeller, async (req, res) => {
  try {
    const { name, phone, businessName, gstNumber, companyAddress } = req.body || {};

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (typeof name === "string") user.name = name;
    if (typeof phone === "string") user.phone = phone;
    if (typeof businessName === "string") user.businessName = businessName;
    if (typeof gstNumber === "string") user.gstNumber = gstNumber;
    if (companyAddress && typeof companyAddress === "object") {
      user.companyAddress = { ...(user.companyAddress || {}), ...companyAddress };
    }

    await user.save();
    return res.json({ success: true, message: "Profile updated", user });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;