import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { buildApiUrl } from '../config/api';
import '../components/ProductCard.css';

const CATEGORY_CONFIG = {
  'apparel-accessories': {
    title: 'Apparel & Accessories',
    subtitle: "Explore clothing and accessories for every style.",
    apiCategoryKey: 'Apparel_Accessories',
    subcategories: [
      { name: "Men's Clothing", apiKey: 'Men_Clothing', icon: '🧥' },
      { name: "Women's Clothing", apiKey: 'Women_Clothing', icon: '👗' },
      { name: "Children's Clothing", apiKey: 'Children_Clothing', icon: '🧒' },
      { name: 'Shoes & Footwear', apiKey: 'Shoes_Footwear', icon: '👟' },
      { name: 'Bags & Handbags', apiKey: 'Bags_Handbags', icon: '👜' },
      { name: 'Watches', apiKey: 'Watches', icon: '⌚' },
      { name: 'Belts & Accessories', apiKey: 'Belts_Accessories', icon: '🧢' },
      { name: 'Jewelry & Accessories', apiKey: 'Jewelry_Accessories', icon: '💎' },
      { name: 'Sports & Activewear', apiKey: 'Sports_Activewear', icon: '🏃' },
      { name: 'Underwear & Lingerie', apiKey: 'Underwear_Lingerie', icon: '👙' }
    ]
  },
  'jewelry': {
    title: 'Jewelry',
    subtitle: 'Rings, necklaces, and more to complete your look.',
    apiCategoryKey: 'Jewelry',
    subcategories: [
      { name: 'Rings', apiKey: 'Rings', icon: '💍' },
      { name: 'Necklaces & Pendants', apiKey: 'Necklaces_Pendants', icon: '📿' },
      { name: 'Earrings', apiKey: 'Earrings', icon: '🧷' },
      { name: 'Bracelets & Bangles', apiKey: 'Bracelets_Bangles', icon: '📎' },
      { name: 'Watches', apiKey: 'Watches', icon: '⌚' },
      { name: 'Brooches & Pins', apiKey: 'Brooches_Pins', icon: '📌' },
      { name: 'Anklets', apiKey: 'Anklets', icon: '🦶' },
      { name: 'Cufflinks', apiKey: 'Cufflinks', icon: '🧥' },
      { name: 'Tie Clips', apiKey: 'Tie_Clips', icon: '👔' },
      { name: 'Jewelry Sets', apiKey: 'Jewelry_Sets', icon: '💠' }
    ]
  }
};

const CategoryLandingPage = () => {
  const { categoryKey } = useParams();
  const navigate = useNavigate();
  const config = CATEGORY_CONFIG[categoryKey];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!config) return;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const url = buildApiUrl(`/api/search?q=${encodeURIComponent(config.title)}`);
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch products');
        }
        setItems(Array.isArray(data) ? data : data.items || []);
      } catch (e) {
        setError(e.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [categoryKey]);

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Category not found</h1>
            <p className="text-gray-600 text-sm">Please go back and choose a valid category.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.08),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.08),transparent_40%)]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-1">{config.title}</h1>
            <p className="text-gray-600 text-sm md:text-base">{config.subtitle}</p>
          </div>
        </div>

        {/* Subcategories grid */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 mb-8">
          <h2 className="text-base md:text-lg font-semibold mb-4">Shop by subcategory</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            {config.subcategories.map((sub) => (
              <button
                key={sub.apiKey}
                type="button"
                className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-xl p-3 md:p-4 text-center transition shadow-sm"
                onClick={() => navigate(`/browse/${config.apiCategoryKey}/${sub.apiKey}`)}
              >
                <div className="text-2xl mb-2">{sub.icon}</div>
                <span className="text-xs md:text-sm font-medium text-gray-800 whitespace-normal">
                  {sub.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Products list */}
        {error && (
          <div className="mb-4 text-sm px-4 py-2 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-600">
            <div className="text-5xl mb-3">🛍️</div>
            <div className="font-medium mb-1">No products found in this category</div>
            <div className="text-sm">Try selecting a specific subcategory above.</div>
          </div>
        ) : (
          <div className="w-full py-1">
            <div className="products grid grid-cols-2 md:grid-cols-4 gap-2">
              {items.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryLandingPage;
