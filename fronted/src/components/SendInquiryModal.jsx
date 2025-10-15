import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';

const SendInquiryModal = ({ isOpen, onClose, product, sellerInfo }) => {
  const { user } = useContext(UserContext);
  const [formData, setFormData] = useState({
    quantity: '1',
    unit: 'pieces',
    message: '',
    buyerName: user?.name || '',
    buyerEmail: user?.email || '',
    buyerPhone: user?.phone || '',
    companyName: '',
    requirements: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Debug logging
      console.log('Product data:', product);
      console.log('Seller info:', sellerInfo);
      
      // Try different possible seller ID fields
      const sellerId = sellerInfo?.sellerId || product.sellerId || product.sellerProfile?.sellerId || product.seller?.sellerId;
      console.log('Extracted sellerId:', sellerId);
      
      if (!sellerId) {
        setSubmitMessage({ type: 'error', text: 'Unable to identify seller. Please try again.' });
        setIsSubmitting(false);
        return;
      }
      
      const inquiryData = {
        productId: product._id,
        productName: product.name,
        sellerId: sellerId,
        sellerCompanyName: sellerInfo?.companyName || product.sellerProfile?.companyName || 'Unknown Company',
        buyerId: user?._id,
        ...formData,
        inquiryDate: new Date().toISOString()
      };
      
      console.log('Inquiry data being sent:', inquiryData);

      const response = await fetch('http://localhost:3000/api/inquiries/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(inquiryData)
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage({ type: 'success', text: 'Inquiry sent successfully! The seller will contact you soon.' });
        setTimeout(() => {
          onClose();
          setSubmitMessage('');
          setFormData({
            quantity: '1',
            unit: 'pieces',
            message: '',
            buyerName: user?.name || '',
            buyerEmail: user?.email || '',
            buyerPhone: user?.phone || '',
            companyName: '',
            requirements: ''
          });
        }, 2000);
      } else {
        setSubmitMessage({ type: 'error', text: result.message || 'Failed to send inquiry. Please try again.' });
      }
    } catch (error) {
      console.error('Error sending inquiry:', error);
      setSubmitMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600">mail</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Send Inquiry</h2>
              <p className="text-sm text-gray-600">Contact supplier for this product</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              {product.images && product.images[0] && (
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600">
                  To: <span className="font-medium text-blue-600">{sellerInfo?.companyName || 'Seller'}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Price: ₹{product.price?.toLocaleString()} | MOQ: {product.moq} pieces
                </p>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quantity Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="pieces">Pieces</option>
                  <option value="sets">Sets</option>
                  <option value="boxes">Boxes</option>
                  <option value="kg">Kilograms</option>
                  <option value="meters">Meters</option>
                  <option value="liters">Liters</option>
                </select>
              </div>
            </div>

            {/* Buyer Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Your Information</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="buyerName"
                    value={formData.buyerName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="buyerPhone"
                    value={formData.buyerPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="buyerEmail"
                    value={formData.buyerEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter company name"
                  />
                </div>
              </div>
            </div>

            {/* Message Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message to Supplier <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                placeholder="Describe your requirements, ask about pricing, shipping, customization, etc."
              />
            </div>

            {/* Additional Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Requirements (Optional)
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                placeholder="Any specific requirements, certifications needed, delivery timeline, etc."
              />
            </div>

            {/* Submit Message */}
            {submitMessage && (
              <div className={`p-4 rounded-lg flex items-center gap-3 ${
                submitMessage.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <span className="material-symbols-outlined">
                  {submitMessage.type === 'success' ? 'check_circle' : 'error'}
                </span>
                {submitMessage.text}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">send</span>
                    Send Inquiry
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendInquiryModal;
