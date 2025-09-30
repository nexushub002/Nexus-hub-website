
// ----------------------
// GET PROFILE
// ----------------------
router.get("/me", verifySeller, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user info" });
  }
});

// Update seller profile (name, phone, business info, GST, address)
router.put("/profile", verifySeller, async (req, res) => {
  try {
    const { name, phone, businessName, gstNumber, companyAddress } = req.body;

    // Current logged-in user
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Already a seller?
    if (user.role === "seller") {
      return res.status(400).json({ success: false, message: "You are already a seller" });
    }

    // Update user role
    user.role = "seller";

    // Create manufacturer profile
    const manufacturer = await Manufacturer.create({
      companyName,
      contactPerson,
      phone,
      factoryAddress,
      user: user._id,
    });

    // Link manufacturer to user
    user.manufacturerProfile = manufacturer._id;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Upgraded to seller successfully",
      user,
      manufacturer
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;