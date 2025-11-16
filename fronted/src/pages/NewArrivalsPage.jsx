import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { buildApiUrl } from '../config/api';

// Normalized keys to match existing browse route
const CATEGORY_KEY_MAP = {
  'Apparel & Accessories': 'Apparel_Accessories',
  'Consumer Electronics': 'Consumer_Electronics',
  'Jewelry': 'Jewelry'
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
  'Jewelry': {
    'Rings': 'Rings',
    'Necklaces & Pendants': 'Necklaces_Pendants',
    'Earrings': 'Earrings',
    'Bracelets & Bangles': 'Bracelets_Bangles',
    'Watches': 'Watches',
    'Brooches & Pins': 'Brooches_Pins',
    'Anklets': 'Anklets',
    'Cufflinks': 'Cufflinks',
    'Tie Clips': 'Tie_Clips',
    'Jewelry Sets': 'Jewelry_Sets'
  }
};

const MAIN_CATEGORIES = Object.keys(CATEGORY_KEY_MAP);

const formatPriceINR = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

function getDisplayPrice(product) {
  if (product.price && product.price > 0) return formatPriceINR(product.price);
  if (product.priceRange?.min != null && product.priceRange?.max != null) {
    return `${formatPriceINR(product.priceRange.min)} - ${formatPriceINR(product.priceRange.max)}`;
  }
  return 'Price on request';
}

function NewArrivalsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeFilter, setActiveFilter] = useState('newest'); // newest | popular | reviewed
  const navigate = useNavigate();
  const catMenuRef = useRef(null);
  const [catMenuOpen, setCatMenuOpen] = useState(false);

  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     try {
  //       setLoading(true);

  //       const url = `${import.meta.env.VITE_API_BASE_URL}/api/showAllProducts`;

  //       const res = await fetch(url);
  //       if (!res.ok) throw new Error('Failed to fetch products');
  //       const data = await res.json();
  //       setProducts(Array.isArray(data) ? data : []);
  //     } catch (e) {
  //       setError(e.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchProducts();
  // }, []);

  useEffect(() => {
  // 1. Create a controller to manage the fetch request
  const controller = new AbortController();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state on new fetch

      const url = buildApiUrl('/api/showAllProducts');

      // 2. Pass the controller's signal to the fetch request
      const res = await fetch(url, { signal: controller.signal });
      
      if (!res.ok) {
        throw new Error('Failed to fetch products from the server');
      }
      
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);

    } catch (e) {
      // Don't set an error if the fetch was aborted by our code
      if (e.name !== 'AbortError') {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();

  // 3. Return a cleanup function
  // This runs when the component unmounts
  return () => {
    controller.abort(); // Cancel the fetch request
  };
}, []); // Empty dependency array means this runs once on mount

  // Group by category -> subcategory and pick top 3 by newest (createdAt desc)
  const grouped = useMemo(() => {
    const byCategory = new Map();
    for (const p of products) {
      if (!MAIN_CATEGORIES.includes(p.category)) continue;
      const cat = p.category;
      const sub = p.subcategory;
      if (!byCategory.has(cat)) byCategory.set(cat, new Map());
      const subMap = byCategory.get(cat);
      if (!subMap.has(sub)) subMap.set(sub, []);
      subMap.get(sub).push(p);
    }
    // sort by newest and slice top3
    for (const [, subMap] of byCategory) {
      for (const [sub, list] of subMap) {
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        subMap.set(sub, list.slice(0, 3));
      }
    }
    return byCategory;
  }, [products]);

  // Build the sections to render based on the active tab
  const sectionsData = useMemo(() => {
    if (activeCategory === 'All') {
      const arr = [];
      for (const [cat, subMap] of grouped) {
        for (const [sub, items] of subMap) {
          arr.push({ category: cat, subcategory: sub, items });
        }
      }
      return arr;
    }

    const subMap = grouped.get(activeCategory) || new Map();
    return Array.from(subMap.entries()).map(([sub, items]) => ({
      category: activeCategory,
      subcategory: sub,
      items
    }));
  }, [grouped, activeCategory]);

  const onSubcategoryNavigate = (categoryLabel, subcategoryLabel) => {
    const ck = CATEGORY_KEY_MAP[categoryLabel];
    const sk = SUBCATEGORY_KEY_MAP[categoryLabel]?.[subcategoryLabel];
    if (!ck || !sk) return;
    navigate(`/browse/${ck}/${sk}`);
  };

  // Close the categories dropdown when clicking outside
  useEffect(() => {
    function onDocClick(e) {
      if (catMenuRef.current && !catMenuRef.current.contains(e.target)) {
        setCatMenuOpen(false);
      }
    }
    if (catMenuOpen) document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [catMenuOpen]);

  if (loading) {
    return (
      <div className="w-full"> 
        <Navbar />
        <div className="h-56 bg-gradient-to-b from-gray-100 to-white" />
        <div className="max-w-7xl mx-auto px-4 -mt-40">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-48 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-center text-red-500 font-medium">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Navbar />
      {/* Hero */}
      <div className="relative h-52 sm:h-64 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-50 via-white to-emerald-100" />
        <div className="pointer-events-none absolute -top-16 left-1/4 w-80 h-80 bg-green-200/50 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -top-10 right-[20%] w-72 h-72 bg-emerald-200/40 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-teal-200/40 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">New Arrivals</h1>
          <p className="mt-2 text-sm text-gray-600">Stay ahead with the latest offerings</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button className="px-4 py-2 bg-white/80 backdrop-blur border border-gray-200 rounded-full text-gray-700 text-sm shadow-sm hover:bg-white transition">
              Latest arrivals
              <span className="ml-2">▾</span>
            </button>
            <div className="relative" ref={catMenuRef}>
              <button
                onClick={() => setCatMenuOpen(v => !v)}
                aria-expanded={catMenuOpen}
                className="px-4 py-2 bg-white/80 backdrop-blur border border-gray-200 rounded-full text-gray-700 text-sm shadow-sm hover:bg-white transition flex items-center"
              >
                {activeCategory === 'All' ? 'All categories' : activeCategory}
                <span className="ml-2">▾</span>
              </button>
              {catMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-20">
                  {['All', ...MAIN_CATEGORIES].map(label => (
                    <button
                      key={label}
                      onClick={() => { setActiveCategory(label); setCatMenuOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50 ${activeCategory === label ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Category Tabs */}
        <div className="flex items-center gap-4 overflow-x-auto pb-3">
          {['All', ...MAIN_CATEGORIES].map((label) => (
            <button
              key={label}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeCategory === label ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveCategory(label)}
            >
              {label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-gray-400">
            <button className="p-2 hover:text-gray-600" title="Prev">←</button>
            <button className="p-2 hover:text-gray-600" title="Next">→</button>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-3 mt-2 border-b border-gray-200 pb-4">
          {[
            { key: 'newest', label: 'Newest first' },
            { key: 'popular', label: 'Most popular' },
            { key: 'reviewed', label: 'Best reviewed' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${activeFilter === f.key ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Subcategory Sections */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sectionsData.length === 0 && (
            <div className="text-gray-500">No new arrivals found.</div>
          )}

          {sectionsData.map(({ category, subcategory, items }) => {
            const ck = CATEGORY_KEY_MAP[category];
            const sk = SUBCATEGORY_KEY_MAP[category]?.[subcategory];
            return (
              <div key={`${category}-${subcategory}`} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between px-4 pt-4">
                  {ck && sk ? (
                    <button
                      onClick={() => onSubcategoryNavigate(category, subcategory)}
                      className="text-left text-base font-semibold text-gray-900 truncate hover:text-gray-700"
                      title={subcategory}
                    >
                      {subcategory}
                    </button>
                  ) : (
                    <h3 className="text-base font-semibold text-gray-900 truncate" title={subcategory}>{subcategory}</h3>
                  )}
                  {ck && sk && (
                    <button
                      onClick={() => onSubcategoryNavigate(category, subcategory)}
                      className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      View more <span>→</span>
                    </button>
                  )}
                </div>

                {/* Products row */}
                <div className="p-4 pt-3">
                  <div className="grid grid-cols-3 gap-3">
                    {items.map((p, idx) => {
                      const createdDate = new Date(p.createdAt);
                      const now = new Date();
                      const daysAgo = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <div key={p._id} className="relative rounded-lg overflow-hidden border border-gray-100 bg-white">
                          {/* NEW badge for recent items */}
                          {daysAgo <= 7 && (
                            <div className={`absolute top-2 right-2 z-10 text-white text-xs font-bold px-2 py-1 rounded-full ${idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-emerald-500' : 'bg-teal-500'}`}>
                              NEW
                            </div>
                          )}

                          <img
                            src={p.images?.[0] || '/placeholder-image.jpg'}
                            alt={p.name}
                            className="w-full h-28 object-cover rounded-lg"
                            onError={(e) => { e.currentTarget.src = '/placeholder-image.jpg'; }}
                          />
                          <div className="p-3">
                            <div className="text-green-600 text-sm font-semibold truncate mb-1" title={getDisplayPrice(p)}>{getDisplayPrice(p)}</div>
                            {p.moq && (
                              <div className="text-xs text-gray-600 mb-1">MOQ: {p.moq}</div>
                            )}
                            {daysAgo <= 60 && (
                              <div className="text-purple-600 text-xs font-medium">
                                Listed {daysAgo === 0 ? 'today' : `${daysAgo} days ago`}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default NewArrivalsPage;
