// models/Wishlist.js
import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index to ensure one product per user in wishlist
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Static method to get user's wishlist with populated product data
wishlistSchema.statics.getUserWishlist = async function(userId) {
  return this.find({ userId })
    .populate({
      path: 'productId',
      select: 'name price priceRange images category subcategory moq sampleAvailable samplePrice'
    })
    .sort({ addedAt: -1 });
};

// Static method to check if product is in user's wishlist
wishlistSchema.statics.isInWishlist = async function(userId, productId) {
  const item = await this.findOne({ userId, productId });
  return !!item;
};

// Static method to add product to wishlist
wishlistSchema.statics.addToWishlist = async function(userId, productId) {
  try {
    const existingItem = await this.findOne({ userId, productId });
    if (existingItem) {
      return { success: false, message: 'Product already in wishlist' };
    }

    const wishlistItem = new this({ userId, productId });
    await wishlistItem.save();
    
    return { success: true, message: 'Product added to wishlist' };
  } catch (error) {
    if (error.code === 11000) {
      return { success: false, message: 'Product already in wishlist' };
    }
    throw error;
  }
};

// Static method to remove product from wishlist
wishlistSchema.statics.removeFromWishlist = async function(userId, productId) {
  const result = await this.deleteOne({ userId, productId });
  if (result.deletedCount > 0) {
    return { success: true, message: 'Product removed from wishlist' };
  } else {
    return { success: false, message: 'Product not found in wishlist' };
  }
};

// Static method to clear entire wishlist
wishlistSchema.statics.clearWishlist = async function(userId) {
  const result = await this.deleteMany({ userId });
  return { success: true, message: `Removed ${result.deletedCount} items from wishlist` };
};

// Static method to get wishlist count
wishlistSchema.statics.getWishlistCount = async function(userId) {
  return this.countDocuments({ userId });
};

export default mongoose.model("Wishlist", wishlistSchema);
