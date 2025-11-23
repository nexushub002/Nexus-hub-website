import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB");

    const adminEmail = "nexushub002@gmail.com".toLowerCase().trim();
    const adminPassword = "Nexushub@001";
    const adminName = "Nexus Hub Admin";

    // Check if admin user already exists (case-insensitive)
    const existingAdmin = await User.findOne({ 
      email: { $regex: new RegExp(`^${adminEmail}$`, 'i') }
    });

    if (existingAdmin) {
      // Update existing user to ensure admin role and correct password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

      existingAdmin.password = hashedPassword;
      existingAdmin.roles = ["admin"];
      existingAdmin.name = adminName;
      await existingAdmin.save();

      console.log("✅ Admin user updated successfully!");
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log(`   Role: admin`);
    } else {
      // Create new admin user
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

      const adminUser = new User({
        name: adminName,
        email: adminEmail.toLowerCase().trim(),
        password: hashedPassword,
        roles: ["admin"],
        isVerified: true,
      });

      await adminUser.save();

      console.log("✅ Admin user created successfully!");
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log(`   Role: admin`);
    }

    // Verify the admin user and test password
    const admin = await User.findOne({ email: adminEmail.toLowerCase().trim() });
    if (admin && admin.roles.includes("admin")) {
      console.log("\n✅ Admin user verified in database");
      console.log(`   ID: ${admin._id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Roles: ${admin.roles.join(", ")}`);
      
      // Test password verification
      const testPassword = await bcrypt.compare(adminPassword, admin.password);
      if (testPassword) {
        console.log(`   ✅ Password verification test: PASSED`);
      } else {
        console.log(`   ❌ Password verification test: FAILED`);
      }
    } else {
      console.log("\n❌ Admin user verification failed!");
      console.log("   Please check if the user was created correctly.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  }
};

createAdminUser();

