import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  roles: { type: [String], default: ["buyer"] }, // buyer by default
  manufacturerProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Manufacturer"
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
