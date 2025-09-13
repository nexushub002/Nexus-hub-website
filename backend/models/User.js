import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String},
  phone: { type: String, unique: true },
  email: { type: String, unique: true },
  role: {
    type: String,
    enum: ["buyer", "manufacturer", "admin"], // ✅ roles
    default: "buyer",
  },
  manufacturerProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Manufacturer"
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);