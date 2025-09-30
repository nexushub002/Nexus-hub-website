import React, { useState, useEffect } from 'react';
import { useSeller } from '../context/SellerContext';

const MyOrders = () => {
  const { seller } = useSeller();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/seller/orders/my-orders', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, itemId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/api/seller/orders/update-status/${orderId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          itemId: itemId
        }),
      });

      if (response.ok) {
        // Refresh orders after status update
        fetchMyOrders();
        alert('Order status updated successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.items.some(item => item.status === statusFilter);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">Manage orders for your products</p>
        </div>
        
        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium mb-2">No orders yet</h3>
          <p className="text-gray-500">Orders for your products will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Order #{order._id.slice(-8)}</h3>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">₹{order.sellerTotal?.toFixed(2) || '0.00'}</p>
                    <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="px-6 py-3 bg-blue-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Customer Details</h4>
                    <p className="text-sm text-gray-600">
                      {order.user?.name} • {order.user?.email} • {order.user?.phone}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {selectedOrder === order._id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-gray-400">📦</div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product?.name}</h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × ₹{item.price} = ₹{(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status || 'pending')}`}>
                          {item.status || 'pending'}
                        </span>
                        
                        <select
                          value={item.status || 'pending'}
                          onChange={(e) => updateOrderStatus(order._id, item._id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expanded Details */}
              {selectedOrder === order._id && (
                <div className="px-6 py-4 bg-gray-50 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Shipping Address</h4>
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress ? (
                          <>
                            {order.shippingAddress.street}<br />
                            {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                            {order.shippingAddress.zipCode}
                          </>
                        ) : (
                          'Address not provided'
                        )}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Order Summary</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>₹{order.sellerTotal?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span>₹0.00</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total:</span>
                          <span>₹{order.sellerTotal?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
