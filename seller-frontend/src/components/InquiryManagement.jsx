import React, { useState, useEffect } from 'react';
import { useSeller } from '../context/SellerContext';

const InquiryManagement = () => {
  const { seller } = useSeller();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyModal, setReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [contactInfo, setContactInfo] = useState({
    phone: seller?.contactPerson?.phone || '',
    email: seller?.contactPerson?.email || '',
    whatsapp: ''
  });

  useEffect(() => {
    if (seller) {
      fetchInquiries();
      fetchStats();
    }
  }, [selectedStatus, seller]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      console.log('Fetching inquiries for seller:', seller);
      
      // Try different possible seller ID fields
      const sellerId = seller?.sellerId || seller?.id || seller?._id;
      console.log('Seller ID being used:', sellerId);
      
      if (!sellerId) {
        setError('Seller ID not found');
        setLoading(false);
        return;
      }
      
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/inquiries/seller/${sellerId}?status=${selectedStatus}`;

      const response = await fetch(url ,
        {
          credentials: 'include'
        }
      );
      const data = await response.json();
      
      if (data.success) {
        setInquiries(data.inquiries);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch inquiries');
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const sellerId = seller?.sellerId || seller?.id || seller?._id;
      console.log('Fetching stats for seller ID:', sellerId);
      
      if (!sellerId) {
        console.error('No seller ID found for stats');
        return;
      }
      
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/inquiries/stats/${sellerId}`;

      const response = await fetch(
        url,
        {
          credentials: 'include'
        }
      );
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) return;

    try {

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/inquiries/reply/${selectedInquiry._id}`;

      const response = await fetch(
        url,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            message: replyMessage,
            contactInfo
          })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setReplyModal(false);
        setReplyMessage('');
        setSelectedInquiry(null);
        fetchInquiries();
        fetchStats();
        alert('Reply sent successfully!');
      } else {
        alert('Failed to send reply: ' + data.message);
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Failed to send reply');
    }
  };

  const updateStatus = async (inquiryId, status) => {
    try {

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/inquiries/status/${inquiryId}`;

      const response = await fetch(
        url ,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ status })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        fetchInquiries();
        fetchStats();
      } else {
        alert('Failed to update status: ' + data.message);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading inquiries...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Inquiry Management</h2>
        <button
          onClick={fetchInquiries}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600">mail</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.today || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600">today</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-yellow-600">pending</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Replied</p>
              <p className="text-2xl font-bold text-green-600">{stats.replied || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600">check_circle</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Inquiries', count: stats.total },
              { key: 'pending', label: 'Pending', count: stats.pending },
              { key: 'replied', label: 'Replied', count: stats.replied },
              { key: 'closed', label: 'Closed', count: stats.closed }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedStatus === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} {tab.count !== undefined && `(${tab.count || 0})`}
              </button>
            ))}
          </nav>
        </div>

        {/* Inquiries List */}
        <div className="divide-y divide-gray-200">
          {inquiries.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-gray-400 text-2xl">mail</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries found</h3>
              <p className="text-gray-500">
                {selectedStatus === 'all' 
                  ? 'You haven\'t received any inquiries yet.'
                  : `No ${selectedStatus} inquiries found.`
                }
              </p>
            </div>
          ) : (
            inquiries.map((inquiry) => (
              <div key={inquiry._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Product Info */}
                    <div className="flex items-center gap-4 mb-4">
                      {inquiry.productId?.images?.[0] && (
                        <img
                          src={inquiry.productId.images[0]}
                          alt={inquiry.productName}
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{inquiry.productName}</h3>
                        <p className="text-sm text-gray-600">
                          Quantity: {inquiry.quantity} {inquiry.unit}
                        </p>
                      </div>
                    </div>

                    {/* Buyer Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Buyer Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <span className="ml-2 font-medium">{inquiry.buyerName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Phone:</span>
                          <span className="ml-2 font-medium">{inquiry.buyerPhone}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <span className="ml-2 font-medium">{inquiry.buyerEmail}</span>
                        </div>
                        {inquiry.companyName && (
                          <div>
                            <span className="text-gray-600">Company:</span>
                            <span className="ml-2 font-medium">{inquiry.companyName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Message</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{inquiry.message}</p>
                      {inquiry.requirements && (
                        <div className="mt-2">
                          <h5 className="font-medium text-gray-900 mb-1">Additional Requirements</h5>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{inquiry.requirements}</p>
                        </div>
                      )}
                    </div>

                    {/* Seller Reply */}
                    {inquiry.sellerReply && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-blue-900 mb-2">Your Reply</h4>
                        <p className="text-blue-800">{inquiry.sellerReply.message}</p>
                        <p className="text-xs text-blue-600 mt-2">
                          Replied on {formatDate(inquiry.sellerReply.repliedAt)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status and Actions */}
                  <div className="ml-6 flex flex-col items-end gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                      {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                    </span>
                    
                    <p className="text-xs text-gray-500">
                      {formatDate(inquiry.inquiryDate)}
                    </p>

                    <div className="flex gap-2">
                      {inquiry.status === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedInquiry(inquiry);
                            setReplyModal(true);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                        >
                          Reply
                        </button>
                      )}
                      
                      {inquiry.status !== 'closed' && (
                        <button
                          onClick={() => updateStatus(inquiry._id, 'closed')}
                          className="px-3 py-1 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {replyModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Reply to Inquiry</h3>
              <button
                onClick={() => {
                  setReplyModal(false);
                  setSelectedInquiry(null);
                  setReplyMessage('');
                }}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-gray-600">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Inquiry Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Inquiry Details</h4>
                <p className="text-sm text-gray-600">
                  <strong>Product:</strong> {selectedInquiry.productName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Buyer:</strong> {selectedInquiry.buyerName} ({selectedInquiry.buyerPhone})
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Quantity:</strong> {selectedInquiry.quantity} {selectedInquiry.unit}
                </p>
              </div>

              {/* Reply Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Reply Message *
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  placeholder="Write your reply to the buyer's inquiry..."
                />
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Contact Information to Share</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Your email address"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (Optional)</label>
                  <input
                    type="tel"
                    value={contactInfo.whatsapp}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, whatsapp: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="WhatsApp number"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setReplyModal(false);
                    setSelectedInquiry(null);
                    setReplyMessage('');
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyMessage.trim()}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryManagement;
