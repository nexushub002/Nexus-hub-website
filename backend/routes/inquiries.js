import express from 'express';
import Inquiry from '../models/Inquiry.js';
import { authMiddleware as auth } from '../middleware/auth.js';

const router = express.Router();

// Send a new inquiry
router.post('/send', async (req, res) => {
  try {
    console.log('Received inquiry request:', req.body);
    
    const {
      productId,
      productName,
      sellerId,
      sellerCompanyName,
      buyerId,
      buyerName,
      buyerEmail,
      buyerPhone,
      companyName,
      quantity,
      unit,
      message,
      requirements
    } = req.body;
    
    console.log('Extracted sellerId:', sellerId);

    // Validate required fields
    if (!productId || !productName || !sellerId || !buyerName || !buyerEmail || !buyerPhone || !quantity || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create new inquiry
    const inquiry = new Inquiry({
      productId,
      productName,
      sellerId,
      sellerCompanyName,
      buyerId,
      buyerName,
      buyerEmail,
      buyerPhone,
      companyName,
      quantity,
      unit: unit || 'pieces',
      message,
      requirements,
      status: 'pending'
    });

    await inquiry.save();
    console.log('Inquiry saved successfully:', inquiry._id);

    res.status(201).json({
      success: true,
      message: 'Inquiry sent successfully',
      inquiry: {
        id: inquiry._id,
        productName: inquiry.productName,
        sellerCompanyName: inquiry.sellerCompanyName,
        status: inquiry.status,
        inquiryDate: inquiry.inquiryDate
      }
    });

  } catch (error) {
    console.error('Error sending inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send inquiry',
      error: error.message
    });
  }
});

// Get inquiries for a seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    
    console.log('Fetching inquiries for sellerId:', sellerId);

    const query = { sellerId };
    if (status && status !== 'all') {
      query.status = status;
    }
    
    console.log('Query:', query);

    const inquiries = await Inquiry.find(query)
      .populate('productId', 'name images price')
      .sort({ inquiryDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Inquiry.countDocuments(query);
    
    console.log(`Found ${inquiries.length} inquiries for seller ${sellerId}, total: ${total}`);

    res.json({
      success: true,
      inquiries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalInquiries: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching seller inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: error.message
    });
  }
});

// Get inquiries for a buyer
router.get('/buyer/:buyerId', auth, async (req, res) => {
  try {
    const { buyerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Verify the buyer is requesting their own inquiries
    if (req.user.id !== buyerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const inquiries = await Inquiry.find({ buyerId })
      .populate('productId', 'name images price')
      .sort({ inquiryDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Inquiry.countDocuments({ buyerId });

    res.json({
      success: true,
      inquiries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalInquiries: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching buyer inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: error.message
    });
  }
});

// Reply to an inquiry (seller only)
router.put('/reply/:inquiryId', async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const { message, contactInfo } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }

    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Update inquiry with seller reply
    inquiry.sellerReply = {
      message,
      repliedAt: new Date(),
      contactInfo: contactInfo || {}
    };
    inquiry.status = 'replied';
    inquiry.repliedAt = new Date();

    await inquiry.save();

    res.json({
      success: true,
      message: 'Reply sent successfully',
      inquiry
    });

  } catch (error) {
    console.error('Error replying to inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply',
      error: error.message
    });
  }
});

// Update inquiry status
router.put('/status/:inquiryId', async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const { status } = req.body;

    if (!['pending', 'replied', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      inquiryId,
      { status },
      { new: true }
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      inquiry
    });

  } catch (error) {
    console.error('Error updating inquiry status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
});

// Get inquiry statistics for seller dashboard
router.get('/stats/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;

    const stats = await Inquiry.aggregate([
      { $match: { sellerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalInquiries = await Inquiry.countDocuments({ sellerId });
    const todayInquiries = await Inquiry.countDocuments({
      sellerId,
      inquiryDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });

    const formattedStats = {
      total: totalInquiries,
      today: todayInquiries,
      pending: 0,
      replied: 0,
      closed: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      stats: formattedStats
    });

  } catch (error) {
    console.error('Error fetching inquiry stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// Delete an inquiry
router.delete('/:inquiryId', async (req, res) => {
  try {
    const { inquiryId } = req.params;

    const inquiry = await Inquiry.findByIdAndDelete(inquiryId);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      message: 'Inquiry deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inquiry',
      error: error.message
    });
  }
});

export default router;
