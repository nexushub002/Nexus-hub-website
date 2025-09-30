import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online', 'upi'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderNotes: String,
  trackingNumber: String,
  estimatedDelivery: Date,
  actualDelivery: Date
}, {
  timestamps: true
});

// Index for efficient queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'items.product': 1 });
orderSchema.index({ status: 1 });

// Virtual for order total calculation
orderSchema.virtual('calculatedTotal').get(function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Method to get seller-specific items
orderSchema.methods.getSellerItems = function(sellerId) {
  return this.items.filter(item => 
    item.product && item.product.seller && item.product.seller.toString() === sellerId.toString()
  );
};

const Order = mongoose.model("Order", orderSchema);

export default Order;
