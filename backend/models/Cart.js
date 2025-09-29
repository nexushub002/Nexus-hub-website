// models/Cart.js
import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one entry per user-product combination
cartSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Update the updatedAt field before saving
cartSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods for cart operations
cartSchema.statics.addToCart = async function(userId, productId, quantity = 1) {
  try {
    const existingItem = await this.findOne({ userId, productId });
    
    if (existingItem) {
      // Update quantity if item already exists
      existingItem.quantity += quantity;
      existingItem.updatedAt = new Date();
      return await existingItem.save();
    } else {
      // Create new cart item
      return await this.create({ userId, productId, quantity });
    }
  } catch (error) {
    throw error;
  }
};

cartSchema.statics.updateQuantity = async function(userId, productId, quantity) {
  try {
    if (quantity <= 0) {
      return await this.deleteOne({ userId, productId });
    }
    
    return await this.findOneAndUpdate(
      { userId, productId },
      { quantity, updatedAt: new Date() },
      { new: true }
    );
  } catch (error) {
    throw error;
  }
};

cartSchema.statics.removeFromCart = async function(userId, productId) {
  try {
    return await this.deleteOne({ userId, productId });
  } catch (error) {
    throw error;
  }
};

cartSchema.statics.getCartItems = async function(userId) {
  try {
    return await this.find({ userId })
      .populate({
        path: 'productId',
        select: 'name price priceRange images category subcategory moq sampleAvailable samplePrice'
      })
      .sort({ updatedAt: -1 });
  } catch (error) {
    throw error;
  }
};

cartSchema.statics.clearCart = async function(userId) {
  try {
    return await this.deleteMany({ userId });
  } catch (error) {
    throw error;
  }
};

cartSchema.statics.getCartCount = async function(userId) {
  try {
    const items = await this.find({ userId });
    return items.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    throw error;
  }
};

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
