import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const faqs = [
  { q: 'How do I track my order?', a: 'Go to My Profile → Orders. Each order shows live status and tracking number if shipped.' },
  { q: 'How do I return or replace an item?', a: 'Open the order, click Request Return. Follow the on-screen steps to schedule a pickup.' },
  { q: 'What payment methods are supported?', a: 'We support UPI, cards, netbanking and Cash on Delivery in eligible locations.' },
  { q: 'How do I contact support?', a: 'Use the chat below, or email support@nexushub.app. We reply within 24 hours.' },
];

const ContactCard = ({ icon, title, children }) => (
  <div className="bg-white/80 backdrop-blur rounded-xl border border-gray-100 p-5 shadow-sm">
    <div className="flex items-center gap-3 mb-2">
      <span className="material-symbols-outlined text-blue-600">{icon}</span>
      <h3 className="font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="text-sm text-gray-600">{children}</div>
  </div>
);

const HelpSupport = () => {
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const submitTicket = async (e) => {
    e.preventDefault();
    // Here you can POST to your backend ticket endpoint
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setMessage('Your request has been submitted. Our team will contact you shortly.');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.08),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.08),transparent_40%)]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6">
        {/* Hero */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Help & Support</h1>
            <p className="text-gray-600 mt-2">We’re here to help with orders, payments, returns and more.</p>
          </div>
          <div className="flex-1 md:max-w-md">
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <span className="material-symbols-outlined text-gray-500 mr-2">search</span>
              <input
                className="bg-transparent outline-none w-full"
                placeholder="Search help articles, e.g. refund, delivery, returns"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Quick contacts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ContactCard icon="chat">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">Live Chat</div>
                <div className="text-xs text-gray-500">Average reply under 2 mins</div>
              </div>
              <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Start Chat</button>
            </div>
          </ContactCard>
          <ContactCard icon="mail">
            <div>
              <div className="font-medium text-gray-800">Email</div>
              <div className="text-xs text-gray-500">support@nexushub.app</div>
            </div>
          </ContactCard>
          <ContactCard icon="call">
            <div>
              <div className="font-medium text-gray-800">Phone</div>
              <div className="text-xs text-gray-500">Mon–Sat, 9am–7pm IST · +91-80-1234-5678</div>
            </div>
          </ContactCard>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Frequently Asked Questions</h2>
            <span className="text-xs text-gray-500">Updated weekly</span>
          </div>
          <div className="divide-y">
            {faqs
              .filter(f => !query || (f.q + f.a).toLowerCase().includes(query.toLowerCase()))
              .map((f, i) => (
                <details key={i} className="py-3 group">
                  <summary className="cursor-pointer list-none flex items-center justify-between">
                    <span className="font-medium text-gray-800 group-open:text-blue-700">{f.q}</span>
                    <span className="material-symbols-outlined text-gray-400">expand_more</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">{f.a}</p>
                </details>
              ))}
          </div>
        </div>

        {/* Submit a request */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Submit a Request</h2>
          {message && (
            <div className="mb-3 text-sm px-4 py-2 rounded bg-blue-50 text-blue-700 border border-blue-200">{message}</div>
          )}
          <form onSubmit={submitTicket} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="px-3 py-2 border rounded-lg" placeholder="Subject" required />
            <select className="px-3 py-2 border rounded-lg">
              <option>Order Issue</option>
              <option>Payment</option>
              <option>Returns/Refunds</option>
              <option>Account</option>
              <option>Other</option>
            </select>
            <textarea className="md:col-span-2 px-3 py-2 border rounded-lg" rows={4} placeholder="Describe your issue" required />
            <div className="md:col-span-2 flex justify-end gap-3">
              <button type="button" className="px-4 py-2 rounded-lg border hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Send</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


export default HelpSupport;