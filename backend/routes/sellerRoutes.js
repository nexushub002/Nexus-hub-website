// backend/routes/sellerDashboard.js
import express from "express";
import { verifySeller } from "../middleware/sellerAuth.js";

const router = express.Router();

router.get("/dashboard", verifySeller, (req, res) => {
  res.json({ message: `Welcome Seller ${req.user.id}` });
});

export default router;
