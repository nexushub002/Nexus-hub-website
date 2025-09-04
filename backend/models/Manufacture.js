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
    documents: [String], // Cloudinary URLs for uploaded docs

    // Profile Media
    companyLogo: { type: String }, // Cloudinary URL
    certificates: [String], // Cloudinary URLs of certifications

    // Extra Info
    aboutCompany: { type: String },
    website: { type: String },
    yearsInBusiness: { type: Number },
    verified: { type: Boolean, default: false }, // admin verification

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Manufacturer", manufacturerSchema);