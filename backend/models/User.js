import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  roles: { type: [String], default: ["buyer"] }, // buyer by default
  
  // Seller-specific fields
  sellerId: { type: String, unique: true, sparse: true }, // Unique seller ID
  businessName: { type: String },
  gstNumber: { type: String },
  companyAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String, default: "India" }
  },
  isVerified: { type: Boolean, default: false },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // Array of product IDs
  
  manufacturerProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Manufacturer"
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
