import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const testAdminLogin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB\n");

    const adminEmail = "nexushub002@gmail.com";
    const adminPassword = "Nexushub@001";

    // Normalize email
    const normalizedEmail = adminEmail.trim().toLowerCase();

    console.log(`🔍 Testing admin login for: ${normalizedEmail}\n`);

    // Find admin user
    const admin = await User.findOne({ 
      $or: [
        { email: normalizedEmail },
        { email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } }
      ],
      roles: { $in: ["admin"] }
    });

    if (!admin) {
      console.log("❌ Admin user not found!");
      console.log("\n💡 Run this command to create admin user:");
      console.log("   npm run create-admin");
      process.exit(1);
    }

    console.log("✅ Admin user found:");
    console.log(`   ID: ${admin._id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name || 'N/A'}`);
    console.log(`   Roles: ${admin.roles.join(", ")}`);
    console.log(`   Has Password: ${admin.password ? 'Yes' : 'No'}\n`);

    // Test password
    if (!admin.password) {
      console.log("❌ Admin user has no password set!");
      console.log("\n💡 Run this command to set password:");
      console.log("   npm run create-admin");
      process.exit(1);
    }

    console.log("🔐 Testing password verification...");
    const isPasswordValid = await bcrypt.compare(adminPassword, admin.password);

    if (isPasswordValid) {
      console.log("✅ Password verification: SUCCESS\n");
      console.log("✅ Admin login test PASSED!");
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
    } else {
      console.log("❌ Password verification: FAILED\n");
      console.log("❌ Admin login test FAILED!");
      console.log("\n💡 Run this command to reset password:");
      console.log("   npm run create-admin");
    }

    process.exit(isPasswordValid ? 0 : 1);
  } catch (error) {
    console.error("❌ Error testing admin login:", error);
    process.exit(1);
  }
};

testAdminLogin();

