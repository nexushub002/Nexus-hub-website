import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    // Unique Seller ID
    sellerId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // recommend bcrypt hashing
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    
    // Company Details (moved from Manufacturer schema)
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    // Public facing unique shop name (for marketplace display)
    shopName: {
      type: String,
      trim: true,
      unique: true, // ensure uniqueness at DB level
      sparse: true, // allow many null/undefined until seller sets it
    },
    yearOfEstablishment: {
      type: Number,
    },
    numberOfEmployees: {
      type: Number,
    },
    companyAddress: {
      type: String,
      required: true,
    },
    factoryAddress: {
      type: String,
    },
    
    // Contact Person
    contactPerson: {
      name: { type: String, required: true },
      designation: { type: String },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    
    // Legal & Verification Information
    gstNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    cin: { type: String }, // Company Identification Number
    pan: { type: String }, // PAN number
    
    // Address (legacy field - keeping for backward compatibility)
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: "India",
      },
    },
    
    // Documents and Media
    documents: [{
      url: { type: String, required: true },
      originalName: { type: String },
      format: { type: String },
      resourceType: { type: String },
      uploadedAt: { type: Date, default: Date.now }
    }], // Cloudinary URLs with metadata for uploaded docs
    
    companyLogo: {
      url: { type: String },
      originalName: { type: String },
      format: { type: String },
      uploadedAt: { type: Date, default: Date.now }
    }, // Cloudinary URL with metadata
    
    certificates: [{
      url: { type: String, required: true },
      originalName: { type: String },
      format: { type: String },
      resourceType: { type: String },
      uploadedAt: { type: Date, default: Date.now }
    }], // Cloudinary URLs with metadata for certifications
    
    // Extra Information
    aboutCompany: { type: String },
    website: { type: String },
    yearsInBusiness: { type: Number },
    
    // Verification and Role
    role: {
      type: String,
      enum: ["seller"],
      default: "seller",
    },
    isVerified: {
      type: Boolean,
      default: false, // set true once email/phone verification is done
    },
    verified: { type: Boolean, default: false }, // admin verification (from manufacturer)
    
    // Products array to store all product IDs created by this seller
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

const Seller = mongoose.model("Seller", sellerSchema);

export default Seller;
