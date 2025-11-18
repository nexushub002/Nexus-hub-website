import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../compo/Sidebar';
import { useSeller } from '../context/SellerContext';

const CATEGORIES = {
  'Apparel & Accessories': [
    "Men's Clothing",
    "Women's Clothing",
    "Children's Clothing",
    'Shoes & Footwear',
    'Bags & Handbags',
    'Watches',
    'Belts & Accessories',
    'Jewelry & Accessories',
    'Sports & Activewear',
    'Underwear & Lingerie'
  ],
  'Consumer Electronics': [
    'Mobile Phones & Accessories',
    'Computers & Laptops',
    'Audio & Video Equipment',
    'Gaming Consoles & Accessories',
    'Cameras & Photography',
    'Home Appliances',
    'Smart Home Devices',
    'Wearable Technology',
    'Electronic Components',
    'Office Electronics'
  ],
  Jewelry: [
    'Rings',
    'Necklaces & Pendants',
    'Earrings',
    'Bracelets & Bangles',
    'Watches',
    'Brooches & Pins',
    'Anklets',
    'Cufflinks',
    'Tie Clips',
    'Jewelry Sets'
  ]
};

const CATEGORY_KEY_MAP = {
  'Apparel & Accessories': 'Apparel_Accessories',
  'Consumer Electronics': 'Consumer_Electronics',
  Jewelry: 'Jewelry'
};

const SUBCATEGORY_KEY_MAP = {
  'Apparel & Accessories': {
    "Men's Clothing": 'Men_Clothing',
    "Women's Clothing": 'Women_Clothing',
    "Children's Clothing": 'Children_Clothing',
    'Shoes & Footwear': 'Shoes_Footwear',
    'Bags & Handbags': 'Bags_Handbags',
    'Watches': 'Watches',
    'Belts & Accessories': 'Belts_Accessories',
    'Jewelry & Accessories': 'Jewelry_Accessories',
    'Sports & Activewear': 'Sports_Activewear',
    'Underwear & Lingerie': 'Underwear_Lingerie'
  },
  'Consumer Electronics': {
    'Mobile Phones & Accessories': 'Mobile_Phones_Accessories',
    'Computers & Laptops': 'Computers_Laptops',
    'Audio & Video Equipment': 'Audio_Video_Equipment',
    'Gaming Consoles & Accessories': 'Gaming_Consoles_Accessories',
    'Cameras & Photography': 'Cameras_Photography',
    'Home Appliances': 'Home_Appliances',
    'Smart Home Devices': 'Smart_Home_Devices',
    'Wearable Technology': 'Wearable_Technology',
    'Electronic Components': 'Electronic_Components',
    'Office Electronics': 'Office_Electronics'
  },
  Jewelry: {
    Rings: 'Rings',
    'Necklaces & Pendants': 'Necklaces_Pendants',
    Earrings: 'Earrings',
    'Bracelets & Bangles': 'Bracelets_Bangles',
    Watches: 'Watches',
    'Brooches & Pins': 'Brooches_Pins',
    Anklets: 'Anklets',
    Cufflinks: 'Cufflinks',
    'Tie Clips': 'Tie_Clips',
    'Jewelry Sets': 'Jewelry_Sets'
  }
};

const toKey = (label) =>
  (label || '')
    .replace(/&/g, ' ')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_{2,}/g, '_');

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSeller();
  const [isDarkMode, setIsDarkMode] = useState(false);
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
    customization: false
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleToggleTheme = () => setIsDarkMode((v) => !v);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const url = `${import.meta.env.VITE_API_BASE_URL}/api/products-new/product/${productId}`;
        const res = await fetch(url, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Unable to load product');
        }
        const product = data.product || {};
        setForm({
          name: product.name || '',
          category: product.category || '',
          subcategory: product.subcategory || '',
          description: product.description || '',
          price: product.price || '',
          priceRangeMin: product.priceRange?.min || '',
          priceRangeMax: product.priceRange?.max || '',
          moq: product.moq || '',
          sampleAvailable: !!product.sampleAvailable,
          samplePrice: product.samplePrice || '',
          hsCode: product.hsCode || '',
          warranty: product.warranty || '',
          returnPolicy: product.returnPolicy || '',
          customization: !!product.customization
        });
        setExistingImages(product.images || []);
        setLoaded(true);
      } catch (error) {
        console.error('Failed to load product', error);
        setMessage({ type: 'error', text: error.message || 'Failed to load product' });
      }
    };
    if (isAuthenticated) {
      loadProduct();
    }
  }, [productId, isAuthenticated]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setForm((prev) => ({
      ...prev,
      category,
      subcategory: ''
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImagesToCloudinary = async (imageFiles) => {
    if (!imageFiles.length) return [];
    const uploadPromises = imageFiles.map(async (file) => {
      if (!file.type.startsWith('image/')) {
        throw new Error(`${file.name} is not a valid image file`);
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`${file.name} exceeds the 10MB size limit`);
      }
      const formData = new FormData();
      formData.append('images', file);
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/upload/images`;
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !data.images?.length) {
        throw new Error(data.message || `Failed to upload ${file.name}`);
      }
      return data.images[0];
    });
    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      let uploadedImages = [];
      if (newImages.length) {
        setMessage({ type: 'info', text: 'Uploading new images...' });
        uploadedImages = await uploadImagesToCloudinary(newImages);
      }
      const finalImages = [...existingImages, ...uploadedImages];
      if (!finalImages.length) {
        throw new Error('Please keep at least one product image');
      }

      const categoryKey = CATEGORY_KEY_MAP[form.category] || toKey(form.category);
      const subcategoryKey =
        (SUBCATEGORY_KEY_MAP[form.category] && SUBCATEGORY_KEY_MAP[form.category][form.subcategory]) ||
        toKey(form.subcategory);

      const payload = {
        name: form.name.trim(),
        category: form.category,
        subcategory: form.subcategory,
        categoryKey,
        subcategoryKey,
        description: form.description?.trim() || '',
        price: Number(form.price),
        priceRange: {
          min: form.priceRangeMin ? Number(form.priceRangeMin) : undefined,
          max: form.priceRangeMax ? Number(form.priceRangeMax) : undefined
        },
        moq: Math.max(1, Number(form.moq) || 1),
        sampleAvailable: !!form.sampleAvailable,
        samplePrice: form.samplePrice ? Number(form.samplePrice) : undefined,
        hsCode: form.hsCode?.trim(),
        warranty: form.warranty?.trim(),
        returnPolicy: form.returnPolicy?.trim(),
        customization: !!form.customization,
        images: finalImages
      };

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/products-new/update/${productId}`;
      const response = await fetch(url, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update product');
      }
      setMessage({ type: 'success', text: 'Product updated successfully! Redirecting...' });
      setTimeout(() => navigate('/seller/my-products'), 1500);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update product' });
      console.error('Update product error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading product...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Please log in to edit products.</div>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'bg-[#141b2d] text-white' : 'bg-[#f5f7fb] text-[#0f172a]'} min-h-screen`}>
      <div className="flex">
        <Sidebar isDarkMode={isDarkMode} onToggleTheme={handleToggleTheme} onSwitchRole={() => (window.location.href = '/')} />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Product</p>
              <h1 className="text-2xl font-semibold">Edit Product</h1>
            </div>
            <button
              onClick={() => navigate('/seller/my-products')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Back to My Products
            </button>
          </div>

          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : message.type === 'info'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-2xl p-6 shadow-sm`}>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="name"
                placeholder="Product Name"
                value={form.name}
                onChange={handleInputChange}
                required
                className="px-3 py-2 rounded border bg-white border-gray-300"
              />
              <select
                name="category"
                value={form.category}
                onChange={handleCategoryChange}
                required
                className="px-3 py-2 rounded border bg-white border-gray-300"
              >
                <option value="">Select Category</option>
                {Object.keys(CATEGORIES).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                name="subcategory"
                value={form.subcategory}
                onChange={handleInputChange}
                required
                disabled={!form.category}
                className="px-3 py-2 rounded border bg-white border-gray-300"
              >
                <option value="">Select Subcategory</option>
                {form.category &&
                  CATEGORIES[form.category]?.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
              </select>
              <input
                name="price"
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={handleInputChange}
                required
                className="px-3 py-2 rounded border bg-white border-gray-300"
              />
              <input
                name="moq"
                type="number"
                placeholder="MOQ"
                value={form.moq}
                onChange={handleInputChange}
                required
                className="px-3 py-2 rounded border bg-white border-gray-300"
              />
              <input
                name="priceRangeMin"
                type="number"
                placeholder="Price Range Min"
                value={form.priceRangeMin}
                onChange={handleInputChange}
                className="px-3 py-2 rounded border bg-white border-gray-300"
              />
              <input
                name="priceRangeMax"
                type="number"
                placeholder="Price Range Max"
                value={form.priceRangeMax}
                onChange={handleInputChange}
                className="px-3 py-2 rounded border bg-white border-gray-300"
              />
              <input
                name="samplePrice"
                type="number"
                placeholder="Sample Price"
                value={form.samplePrice}
                onChange={handleInputChange}
                className="px-3 py-2 rounded border bg-white border-gray-300"
              />
              <input
                name="hsCode"
                placeholder="HS Code"
                value={form.hsCode}
                onChange={handleInputChange}
                className="px-3 py-2 rounded border bg-white border-gray-300 md:col-span-2"
              />
              <input
                name="warranty"
                placeholder="Warranty"
                value={form.warranty}
                onChange={handleInputChange}
                className="px-3 py-2 rounded border bg-white border-gray-300 md:col-span-2"
              />
              <input
                name="returnPolicy"
                placeholder="Return Policy"
                value={form.returnPolicy}
                onChange={handleInputChange}
                className="px-3 py-2 rounded border bg-white border-gray-300 md:col-span-2"
              />
              <textarea
                name="description"
                rows="4"
                placeholder="Product Description"
                value={form.description}
                onChange={handleInputChange}
                className="px-3 py-2 rounded border bg-white border-gray-300 md:col-span-2"
              />

              <div className="md:col-span-2 flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="sampleAvailable"
                    checked={form.sampleAvailable}
                    onChange={handleInputChange}
                  />
                  Sample Available
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="customization"
                    checked={form.customization}
                    onChange={handleInputChange}
                  />
                  Customization Available
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Existing Images</label>
                {existingImages.length === 0 && (
                  <p className="text-sm text-gray-500">No images yet. Please upload new images below.</p>
                )}
                {existingImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img src={img} alt={`Product ${index + 1}`} className="h-28 w-full object-cover rounded-lg border" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Add New Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="new-images" />
                  <label htmlFor="new-images" className="cursor-pointer text-blue-600">
                    Click to select images
                  </label>
                </div>
                {newImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {newImages.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New ${index + 1}`}
                          className="h-28 w-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full md:w-auto px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {submitting ? 'Updating Product...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditProduct;

