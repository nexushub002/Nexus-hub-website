// Example: How buyers send inquiries from product page
import React, { useState } from 'react';

const ProductInquiryForm = ({ product, seller }) => {
  const [form, setForm] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    companyName: '',
    quantity: '',
    unit: 'pieces',
    message: '',
    requirements: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inquiries/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          productName: product.name,
          sellerId: product.sellerId, // This is the seller's unique ID (string)
          sellerCompanyName: seller?.companyName || 'Company',
          ...form
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Inquiry sent successfully!');
        // Reset form or redirect
      } else {
        alert('Failed to send inquiry: ' + data.message);
      }
    } catch (error) {
      console.error('Error sending inquiry:', error);
      alert('Failed to send inquiry');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-bold">Send Inquiry</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <input
          name="buyerName"
          placeholder="Your Name *"
          value={form.buyerName}
          onChange={handleChange}
          required
          className="px-3 py-2 border rounded-lg"
        />
        <input
          name="buyerPhone"
          placeholder="Phone Number *"
          value={form.buyerPhone}
          onChange={handleChange}
          required
          className="px-3 py-2 border rounded-lg"
        />
      </div>

      <input
        name="buyerEmail"
        type="email"
        placeholder="Email Address *"
        value={form.buyerEmail}
        onChange={handleChange}
        required
        className="w-full px-3 py-2 border rounded-lg"
      />

      <input
        name="companyName"
        placeholder="Company Name (Optional)"
        value={form.companyName}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded-lg"
      />

      <div className="grid grid-cols-3 gap-4">
        <input
          name="quantity"
          type="number"
          placeholder="Quantity *"
          value={form.quantity}
          onChange={handleChange}
          required
          className="col-span-2 px-3 py-2 border rounded-lg"
        />
        <select
          name="unit"
          value={form.unit}
          onChange={handleChange}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="pieces">Pieces</option>
          <option value="kg">Kg</option>
          <option value="tons">Tons</option>
          <option value="units">Units</option>
        </select>
      </div>

      <textarea
        name="message"
        placeholder="Your Message *"
        value={form.message}
        onChange={handleChange}
        required
        rows={4}
        className="w-full px-3 py-2 border rounded-lg"
      />

      <textarea
        name="requirements"
        placeholder="Additional Requirements (Optional)"
        value={form.requirements}
        onChange={handleChange}
        rows={3}
        className="w-full px-3 py-2 border rounded-lg"
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
      >
        Send Inquiry
      </button>
    </form>
  );
};

export default ProductInquiryForm;
