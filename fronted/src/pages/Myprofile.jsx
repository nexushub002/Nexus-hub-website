import React, { useState, useContext, useEffect, useMemo } from 'react';
import { UserContext } from "../context/UserContext";
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const getInitial = (s) => (s && s.trim() ? s.trim().charAt(0).toUpperCase() : 'U');
const stringToColor = (str = 'user') => {
  let hash = 0; for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360; return `hsl(${h}, 70%, 45%)`;
};

const Myprofile = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const displayName = useMemo(() => user?.name || user?.email || user?.phone || 'User', [user]);

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/auth/logout", { method: "POST", credentials: "include" });
      if (res.ok) { setUser(null); window.location.href = "/"; }
    } catch (err) { console.error("Logout error:", err); }
  };

  const faqs = [
    { q: 'How do I track my order?', a: 'Go to Orders page. Each order card shows current status and tracking if available.' },
    { q: 'How do I cancel an order?', a: 'Orders can be cancelled before they are shipped. Open the order and click Cancel.' },
    { q: 'How do I return an item?', a: 'Open the order → Request Return. Follow steps to schedule pickup and refund.' },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.08),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.08),transparent_40%)]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold" style={{ backgroundColor: stringToColor(displayName) }}>{getInitial(displayName)}</div>
            <div>
              <div className="text-xl font-semibold">{displayName}</div>
              <div className="text-sm text-gray-500">{user?.email || user?.phone}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/help')} className="px-3 py-2 rounded-lg border hover:bg-gray-50">Help</button>
            <button onClick={handleLogout} className="px-3 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">Logout</button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{label:'Orders',icon:'shopping_bag',action:()=>navigate('/orders')},
            {label:'Wishlist',icon:'favorite',action:()=>navigate('/wishlist')},
            {label:'Addresses',icon:'location_on',action:()=>alert('Coming soon')},
            {label:'Help & Support',icon:'help',action:()=>navigate('/help')}].map((a)=> (
            <div key={a.label} onClick={a.action} className="cursor-pointer bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">{a.label}</div>
                <div className="text-xs text-blue-600 mt-1">Open</div>
              </div>
              <span className="material-symbols-outlined text-blue-600">{a.icon}</span>
            </div>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Recent Orders</h3>
              <button onClick={()=>navigate('/orders')} className="text-sm text-blue-600">View All</button>
            </div>
            <div className="text-center py-12 text-gray-500">
              <div className="text-5xl mb-2">🛍️</div>
              <div>No orders yet</div>
              <div className="text-xs">Your latest purchases will show up here</div>
            </div>
          </div>

          {/* FAQs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold mb-2">Quick FAQs</h3>
            <div className="divide-y">
              {faqs.map((f,i)=> (
                <details key={i} className="py-2 group">
                  <summary className="list-none cursor-pointer flex items-center justify-between">
                    <span className="text-sm font-medium group-open:text-blue-700">{f.q}</span>
                    <span className="material-symbols-outlined text-gray-400">expand_more</span>
                  </summary>
                  <p className="mt-1 text-xs text-gray-600">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Myprofile;
