import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { buildApiUrl } from '../config/api';

const formatCurrency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {

        const url = buildApiUrl('/api/orders/my');

        const res = await fetch(url, { credentials: 'include' });
        if (res.status === 401) {
          setError('Please login to view your orders.');
          setOrders([]);
          return;
        }
        const data = await res.json();
        if (res.ok) {
          setOrders(data.orders || []);
        } else {
          setError(data.message || 'Failed to fetch orders');
        }
      } catch (e) {
        setError('Network error while fetching orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.08),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.08),transparent_40%)]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your Orders</h1>
            <p className="text-gray-600">Track, return or reorder your items</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm px-4 py-2 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-600">
            <div className="text-6xl mb-3">📦</div>
            <div className="font-medium mb-1">No orders yet</div>
            <div className="text-sm">Your recent purchases will appear here</div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Order ID</div>
                    <div className="font-semibold">{order._id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Placed on</div>
                    <div className="font-medium">{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                <div className="divide-y">
                  {order.items?.map((item) => {
                    const p = item.product || {};
                    const img = Array.isArray(p.images) && p.images.length ? p.images[0] : undefined;
                    return (
                      <div key={item._id} className="py-3 flex items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                          {img ? (
                            <img src={img} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-gray-400 text-2xl">🛍️</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{p.name || 'Product'}</div>
                          <div className="text-xs text-gray-500">Qty: {item.quantity} · {formatCurrency(item.price)}</div>
                        </div>
                        <div className="font-semibold">{formatCurrency(item.price * item.quantity)}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">Status: <span className="font-medium capitalize">{order.status}</span></div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Total</div>
                    <div className="text-lg font-bold">{formatCurrency(order.totalAmount)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;