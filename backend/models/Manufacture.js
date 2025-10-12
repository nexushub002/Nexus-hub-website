import mongoose from "mongoose";

const manufacturerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // link to User account (login email/phone/password)
      required: true,
      unique: true,
    },

    // Company Details
    companyName: {
      type: String,
      required: true,
      trim: true,
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

    // Legal & Verification Docs
    gstin: { type: String }, // GST number
    cin: { type: String }, // Company Identification Number
    pan: { type: String }, // PAN number
    documents: [{
      url: { type: String, required: true },
      originalName: { type: String },
      format: { type: String },
      resourceType: { type: String },
      uploadedAt: { type: Date, default: Date.now }
    }], // Cloudinary URLs with metadata for uploaded docs

    // Profile Media
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

    // Extra Info
    aboutCompany: { type: String },
    website: { type: String },
    yearsInBusiness: { type: Number },
    verified: { type: Boolean, default: false }, // admin verification

    // Products array to store all product IDs created by this manufacturer
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    }],

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Manufacturer", manufacturerSchema);