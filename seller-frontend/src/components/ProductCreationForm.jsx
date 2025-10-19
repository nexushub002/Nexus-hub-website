import React, { useState } from 'react';
import { useSeller } from '../context/SellerContext';

const CATEGORIES = {
  "Apparel & Accessories": [
    "Men's Clothing",
    "Women's Clothing", 
    "Children's Clothing",
    "Shoes & Footwear",
    "Bags & Handbags",
    "Watches",
    "Belts & Accessories",
    "Jewelry & Accessories",
    "Sports & Activewear",
    "Underwear & Lingerie"
  ],
  "Consumer Electronics": [
    "Mobile Phones & Accessories",
    "Computers & Laptops",
    "Audio & Video Equipment",
    "Gaming Consoles & Accessories",
    "Cameras & Photography",
    "Home Appliances",
    "Smart Home Devices",
    "Wearable Technology",
    "Electronic Components",
    "Office Electronics"
  ],
  "Jewelry": [
    "Rings",
    "Necklaces & Pendants",
    "Earrings",
    "Bracelets & Bangles",
    "Watches",
    "Brooches & Pins",
    "Anklets",
    "Cufflinks",
    "Tie Clips",
    "Jewelry Sets"
  ]
};

const CATEGORY_KEY_MAP = {
  'Apparel & Accessories': 'Apparel_Accessories',
  'Consumer Electronics': 'Consumer_Electronics',
  'Jewelry': 'Jewelry'
}

const SUBCATEGORY_KEY_MAP = {
  'Apparel & Accessories': {
    "Men's Clothing": 'Men_Clothing',
    "Women's Clothing": 'Women_Clothing',
    "Children's Clothing": 'Children_Clothing',
    "Shoes & Footwear": 'Shoes_Footwear',
    "Bags & Handbags": 'Bags_Handbags',
    "Watches": 'Watches',
    "Belts & Accessories": 'Belts_Accessories',
    "Jewelry & Accessories": 'Jewelry_Accessories',
    "Sports & Activewear": 'Sports_Activewear',
    "Underwear & Lingerie": 'Underwear_Lingerie'
  },
  'Consumer Electronics': {
    "Mobile Phones & Accessories": 'Mobile_Phones_Accessories',
    "Computers & Laptops": 'Computers_Laptops',
    "Audio & Video Equipment": 'Audio_Video_Equipment',
    "Gaming Consoles & Accessories": 'Gaming_Consoles_Accessories',
    "Cameras & Photography": 'Cameras_Photography',
    "Home Appliances": 'Home_Appliances',
    "Smart Home Devices": 'Smart_Home_Devices',
    "Wearable Technology": 'Wearable_Technology',
    "Electronic Components": 'Electronic_Components',
    "Office Electronics": 'Office_Electronics'
  },
  'Jewelry': {
    "Rings": 'Rings',
    "Necklaces & Pendants": 'Necklaces_Pendants',
    "Earrings": 'Earrings',
    "Bracelets & Bangles": 'Bracelets_Bangles',
    "Watches": 'Watches',
    "Brooches & Pins": 'Brooches_Pins',
    "Anklets": 'Anklets',
    "Cufflinks": 'Cufflinks',
    "Tie Clips": 'Tie_Clips',
    "Jewelry Sets": 'Jewelry_Sets'
  }
};

const toKey = (str) => str
  .replace(/[^A-Za-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '')
  .replace(/_{2,}/g, '_');

const ProductCreationForm = ({ isDarkMode, onProductCreated, onCancel }) => {
  const { seller } = useSeller();
  const [form, setForm] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    price: '',
    priceRangeMin: '',
    priceRangeMax: '',
    moq: '',
    sampleAvailable: false,
    samplePrice: '',
    hsCode: '',
    warranty: '',
    returnPolicy: '',
    customization: false,
    images: []
  });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setForm(prev => ({
      ...prev,
      category,
      subcategory: '' // Reset subcategory when category changes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!seller) {
      setMessage('Please log in to create products');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      // Resolve normalized keys for category and subcategory
      const categoryKey = CATEGORY_KEY_MAP[form.category] || toKey(form.category);
      const subcategoryKey = (SUBCATEGORY_KEY_MAP[form.category] && SUBCATEGORY_KEY_MAP[form.category][form.subcategory])
        ? SUBCATEGORY_KEY_MAP[form.category][form.subcategory]
        : toKey(form.subcategory);

      const body = {
        name: form.name,
        category: form.category,
        subcategory: form.subcategory,
        categoryKey,
        subcategoryKey,
        description: form.description,
        price: Number(form.price),
        priceRangeMin: Number(form.priceRangeMin) || undefined,
        priceRangeMax: Number(form.priceRangeMax) || undefined,
        moq: Number(form.moq),
        sampleAvailable: !!form.sampleAvailable,
        samplePrice: form.samplePrice ? Number(form.samplePrice) : undefined,
        hsCode: form.hsCode,
        warranty: form.warranty,
        returnPolicy: form.returnPolicy,
        customization: !!form.customization,
        images: []
      };

      console.log('Product data being sent:', body);

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/products-new/create`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create product');
      }

      setMessage('Product created successfully!');
      
      // Call the callback with the created product
      if (onProductCreated) {
        onProductCreated(data.product);
      }

      // Reset form
      setForm({
        name: '',
        category: '',
        subcategory: '',
        description: '',
        price: '',
        priceRangeMin: '',
        priceRangeMax: '',
        moq: '',
        sampleAvailable: false,
        samplePrice: '',
        hsCode: '',
        warranty: '',
        returnPolicy: '',
        customization: false,
        images: []
      });

      // Close form after successful creation
      setTimeout(() => {
        if (onCancel) onCancel();
      }, 1500);

    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className={`p-3 rounded-lg ${
          message.includes('successfully') 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Product Name *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'
            }`}
            placeholder="Enter product name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Category *</label>
          <select
            name="category"
            value={form.category}
            onChange={handleCategoryChange}
            required
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'
            }`}
          >
            <option value="">Select Category</option>
            {Object.keys(CATEGORIES).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Subcategory *</label>
        <select
          name="subcategory"
          value={form.subcategory}
          onChange={handleChange}
          required
          disabled={!form.category}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'
          }`}
        >
          <option value="">Select Subcategory</option>
          {form.category && CATEGORIES[form.category]?.map(subcategory => (
            <option key={subcategory} value={subcategory}>{subcategory}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'
          }`}
          placeholder="Describe your product..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Price (₹) *</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'
            }`}
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">MOQ *</label>
          <input
            type="number"
            name="moq"
            value={form.moq}
            onChange={handleChange}
            required
            min="1"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'
            }`}
            placeholder="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Sample Price (₹)</label>
          <input
            type="number"
            name="samplePrice"
            value={form.samplePrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'
            }`}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">HS Code</label>
          <input
            type="text"
            name="hsCode"
            value={form.hsCode}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'
            }`}
            placeholder="Enter HS Code"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Warranty</label>
          <input
            type="text"
            name="warranty"
            value={form.warranty}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'
            }`}
            placeholder="e.g., 1 year"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Return Policy</label>
        <textarea
          name="returnPolicy"
          value={form.returnPolicy}
          onChange={handleChange}
          rows={2}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'
          }`}
          placeholder="Describe your return policy..."
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="sampleAvailable"
            checked={form.sampleAvailable}
            onChange={handleChange}
            className="mr-2"
          />
          <span className="text-sm">Sample Available</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            name="customization"
            checked={form.customization}
            onChange={handleChange}
            className="mr-2"
          />
          <span className="text-sm">Customization Available</span>
        </label>
      </div>

      <div className="flex space-x-4 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Creating...' : 'Create Product'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductCreationForm;
