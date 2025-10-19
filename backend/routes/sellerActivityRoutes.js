import express from "express";

const router = express.Router();

// Track seller activity (optional analytics endpoint)
router.post("/track", async (req, res) => {
  try {
    // Log activity (you can save to database if needed)
    console.log("Seller activity tracked:", req.body);
    
    // Return success
    res.json({ 
      success: true, 
      message: "Activity tracked successfully" 
    });
  } catch (error) {
    console.error("Error tracking seller activity:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to track activity" 
    });
  }
});

export default router;
