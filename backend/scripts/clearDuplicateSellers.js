import mongoose from "mongoose";
import dotenv from "dotenv";
import Seller from "../models/SellerProfile.js";

dotenv.config();

const clearDuplicateSellers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB");

    // Find all sellers with duplicate emails
    const duplicates = await Seller.aggregate([
      {
        $group: {
          _id: "$email",
          count: { $sum: 1 },
          docs: { $push: "$_id" }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    console.log(`Found ${duplicates.length} duplicate email groups`);

    // Remove duplicates, keeping only the first one
    for (const duplicate of duplicates) {
      const docsToRemove = duplicate.docs.slice(1); // Keep first, remove rest
      await Seller.deleteMany({ _id: { $in: docsToRemove } });
      console.log(`Removed ${docsToRemove.length} duplicate sellers for email: ${duplicate._id}`);
    }

    console.log("✅ Duplicate cleanup completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

clearDuplicateSellers();
