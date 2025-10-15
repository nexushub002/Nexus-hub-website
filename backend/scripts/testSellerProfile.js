import mongoose from "mongoose";
import dotenv from "dotenv";
import Seller from "../models/SellerProfile.js";
import User from "../models/User.js";

dotenv.config();

const testSellerProfile = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB");

    // Find all sellers
    const sellers = await Seller.find().limit(5);
    console.log(`Found ${sellers.length} sellers in Seller collection`);
    
    sellers.forEach((seller, index) => {
      console.log(`Seller ${index + 1}:`);
      console.log(`  - ID: ${seller._id}`);
      console.log(`  - SellerId: ${seller.sellerId}`);
      console.log(`  - Name: ${seller.name}`);
      console.log(`  - Email: ${seller.email}`);
      console.log(`  - Company: ${seller.companyName}`);
      console.log(`  - GST: ${seller.gstNumber}`);
      console.log("---");
    });

    // Find all users with seller role
    const sellerUsers = await User.find({ roles: "seller" }).limit(5);
    console.log(`\nFound ${sellerUsers.length} users with seller role in User collection`);
    
    sellerUsers.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  - ID: ${user._id}`);
      console.log(`  - SellerId: ${user.sellerId}`);
      console.log(`  - Name: ${user.name}`);
      console.log(`  - Email: ${user.email}`);
      console.log(`  - Roles: ${user.roles}`);
      console.log("---");
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

testSellerProfile();
