import mongoose from 'mongoose';
import Inquiry from './models/Inquiry.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestInquiry = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    // Create a test inquiry
    const testInquiry = new Inquiry({
      productId: new mongoose.Types.ObjectId(),
      productName: "Test Product for Inquiry",
      sellerId: "SELL1729000000001", // Use a test seller ID
      sellerCompanyName: "Test Company",
      buyerId: new mongoose.Types.ObjectId(),
      buyerName: "Test Buyer",
      buyerEmail: "testbuyer@example.com",
      buyerPhone: "1234567890",
      quantity: "5",
      unit: "pieces",
      message: "I am interested in this product. Please provide more details.",
      requirements: "Need it urgently",
      status: "pending"
    });

    await testInquiry.save();
    console.log('✅ Test inquiry created:', testInquiry._id);
    console.log('Seller ID:', testInquiry.sellerId);

    // Verify we can find it
    const foundInquiry = await Inquiry.findOne({ sellerId: "SELL1729000000001" });
    if (foundInquiry) {
      console.log('✅ Test inquiry found in database');
    } else {
      console.log('❌ Test inquiry not found');
    }

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createTestInquiry();
