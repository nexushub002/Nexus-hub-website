import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../config/api';

const ITEMS_PER_CATEGORY = 5;
const MAX_DEALS = 48;
const MIN_DEALS_TO_SHOW = 5;

const formatINR = (n) => new Intl.NumberFormat('en-IN', { 
  style: 'currency', 
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
}).format(n);

function extractBestPrice(p) {
  if (typeof p?.price === 'number' && p.price >= 0) return p.price;
  if (p?.priceRange && typeof p.priceRange.min === 'number') return p.priceRange.min;
  return Number.POSITIVE_INFINITY;
}

function extractOldPrice(p) {
  if (p?.priceRange && typeof p.priceRange.max === 'number' && p.priceRange.max > (p.priceRange.min ?? 0)) {
    return p.priceRange.max;
  }
  return null;
}

const TopDealsImproved = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const navigate = useNavigate();
  const scrollerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const url = buildApiUrl('/api/showAllProducts');

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setAllProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const deals = useMemo(() => {
    if (!Array.isArray(allProducts) || allProducts.length === 0) return [];

    // First, get all products sorted by best price
    const allSorted = allProducts
      .slice()
      .sort((a, b) => extractBestPrice(a) - extractBestPrice(b));

    // If we have fewer than MIN_DEALS_TO_SHOW products, return all
    if (allSorted.length <= MIN_DEALS_TO_SHOW) {
      return allSorted;
    }

    // Group by category for diversity
    const grouped = new Map();
    for (const p of allProducts) {
      const cat = p.category || 'Others';
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat).push(p);
    }

    const buckets = Array.from(grouped.values()).map(arr => {
      const copy = arr.slice().sort((a, b) => extractBestPrice(a) - extractBestPrice(b));
      return copy.slice(0, ITEMS_PER_CATEGORY);
    }).filter(arr => arr.length > 0);

    const out = [];
    let i = 0;
    while (out.length < MAX_DEALS) {
      let pushedAny = false;
      for (const bucket of buckets) {
        if (bucket[i]) {
          out.push(bucket[i]);
          if (out.length >= MAX_DEALS) break;
          pushedAny = true;
        }
      }
      if (!pushedAny) break;
      i += 1;
    }

    // Ensure we have at least MIN_DEALS_TO_SHOW products
    if (out.length < MIN_DEALS_TO_SHOW) {
      // Add more products from the sorted list if needed
      const existingIds = new Set(out.map(p => p._id));
      for (const product of allSorted) {
        if (!existingIds.has(product._id)) {
          out.push(product);
          if (out.length >= MIN_DEALS_TO_SHOW) break;
        }
      }
    }

    return out;
  }, [allProducts]);

  const scrollByAmount = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = dir === 'left' ? -1 : 1;
    el.scrollBy({ left: delta * Math.min(el.clientWidth, 600), behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="w-full bg-gray-50 py-8">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                <div className="space-y-2">
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-9 w-28 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="min-w-[280px] sm:min-w-[320px] h-72 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-gray-50 py-8">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load deals</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (deals.length === 0) return null;

  return (
    <div className="w-full bg-gray-50 py-8">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Top Deals</h2>
                <p className="text-sm text-gray-600">Score the lowest prices on NexusHub</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/top-deals')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors duration-200"
            >
              <span>View All Deals</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          {/* Horizontal scroller */}
          <div className="relative group">
            {/* Gradient edges */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 hidden sm:block" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 hidden sm:block" />

            {/* Navigation arrows */}
            <button
              aria-label="Scroll left"
              onClick={() => scrollByAmount('left')}
              className="hidden group-hover:flex sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 rounded-full w-10 h-10 items-center justify-center transition-all duration-200"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button
              aria-label="Scroll right"
              onClick={() => scrollByAmount('right')}
              className="hidden group-hover:flex sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 rounded-full w-10 h-10 items-center justify-center transition-all duration-200"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </button>

            <div ref={scrollerRef} className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 py-1 scrollbar-hide">
              {deals.map((p, idx) => {
                const price = extractBestPrice(p);
                const old = extractOldPrice(p);
                const created = new Date(p.createdAt || Date.now());
                const daysAgo = Math.floor((Date.now() - created.getTime()) / (1000*60*60*24));
                const isFlash = daysAgo <= 7 && Number.isFinite(price);
                const discount = old && Number.isFinite(price) ? Math.round(((old - price) / old) * 100) : null;

                return (
                  <div
                    key={p._id || idx}
                    onClick={() => navigate(`/product-detail/${p._id}`)}
                    className="snap-start min-w-[280px] sm:min-w-[320px] lg:min-w-[340px] bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200 group/card"
                  >
                    <div className="relative">
                      <img
                        src={p.images?.[0] || '/placeholder-image.jpg'}
                        alt={p.name}
                        className="w-full h-40 sm:h-48 object-contain p-4 bg-gray-50"
                        onError={(e) => { e.currentTarget.src = '/placeholder-image.jpg'; }}
                      />
                      
                      {/* Badge */}
                      <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium text-white ${
                        isFlash ? 'bg-blue-600' : 'bg-gray-700'
                      }`}>
                        {isFlash ? 'Flash Deal' : 'Super Deal'}
                      </div>

                      {/* Discount Badge */}
                      {discount && discount > 0 && (
                        <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                          -{discount}%
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">
                        {p.name}
                      </h3>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {Number.isFinite(price) ? (
                            <span className="text-gray-900 font-bold text-lg">
                              {formatINR(price)}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm font-medium">Price on request</span>
                          )}
                          {old && (
                            <span className="text-gray-400 line-through text-sm">
                              {formatINR(old)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-2 flex-wrap">
                          {p.moq && (
                            <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                              MOQ: {p.moq}
                            </span>
                          )}
                          
                          {/* Category tag */}
                          {p.category && (
                            <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                              {p.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product-detail/${p._id}`);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors duration-200"
                      >
                        View Deal
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopDealsImproved;
