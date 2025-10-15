import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  // Product Information
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  
  // Seller Information
  sellerId: {
    type: String,
    required: true
  },
  sellerCompanyName: {
    type: String,
    required: true
  },
  
  // Buyer Information
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  buyerName: {
    type: String,
    required: true
  },
  buyerEmail: {
    type: String,
    required: true
  },
  buyerPhone: {
    type: String,
    required: true
  },
  companyName: {
    type: String
  },
  
  // Inquiry Details
  quantity: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    default: 'pieces'
  },
  message: {
    type: String,
    required: true
  },
  requirements: {
    type: String
  },
  
  // Status and Timestamps
  status: {
    type: String,
    enum: ['pending', 'replied', 'closed'],
    default: 'pending'
  },
  inquiryDate: {
    type: Date,
    default: Date.now
  },
  repliedAt: {
    type: Date
  },
  
  // Seller Reply (if any)
  sellerReply: {
    message: String,
    repliedAt: Date,
    contactInfo: {
      phone: String,
      email: String,
      whatsapp: String
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
inquirySchema.index({ sellerId: 1, inquiryDate: -1 });
inquirySchema.index({ buyerId: 1, inquiryDate: -1 });
inquirySchema.index({ productId: 1 });
inquirySchema.index({ status: 1 });

export default mongoose.model('Inquiry', inquirySchema);
