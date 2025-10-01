import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3000/api';
const ITEMS_PER_CATEGORY = 3;    // how many deals per category
const MAX_DEALS = 48;            // total cap to render

const formatINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

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

const TopDeals = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const navigate = useNavigate();
  const scrollerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/showAllProducts`);
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

  // Select up to ITEMS_PER_CATEGORY per category (lowest prices first), then interleave across categories up to MAX_DEALS
  const deals = useMemo(() => {
    if (!Array.isArray(allProducts) || allProducts.length === 0) return [];

    // Group products by category
    const grouped = new Map();
    for (const p of allProducts) {
      const cat = p.category || 'Others';
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat).push(p);
    }

    // Sort each category by best price asc and take first N
    const buckets = Array.from(grouped.values()).map(arr => {
      const copy = arr.slice().sort((a, b) => extractBestPrice(a) - extractBestPrice(b));
      return copy.slice(0, ITEMS_PER_CATEGORY);
    }).filter(arr => arr.length > 0);

    // Interleave (round-robin) to mix categories nicely
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
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-40 bg-gray-100 rounded mt-2 animate-pulse" />
            </div>
            <div className="h-9 w-24 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="min-w-[160px] sm:min-w-[200px] h-40 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-red-600">{error}</div>
      </div>
    );
  }

  if (deals.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-200 p-3 sm:p-4">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between mb-3 sm:mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Top Deals</h2>
            <p className="text-xs sm:text-sm text-gray-600">Score the lowest prices on NexusHub</p>
          </div>
          <button
            onClick={() => navigate('/top-deals')}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg text-gray-700 text-sm hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition"
          >
            <span>View more</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        {/* Horizontal scroller */}
        <div className="relative group">
          {/* edge fades */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white to-transparent hidden sm:block" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent hidden sm:block" />

          {/* arrows (show on hover; always visible >= sm) */}
          <button
            aria-label="Scroll left"
            onClick={() => scrollByAmount('left')}
            className="hidden group-hover:flex sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white border border-gray-200 shadow-md hover:shadow-lg rounded-full w-10 h-10 items-center justify-center transition-all duration-200 hover:scale-105"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button
            aria-label="Scroll right"
            onClick={() => scrollByAmount('right')}
            className="hidden group-hover:flex sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white border border-gray-200 shadow-md hover:shadow-lg rounded-full w-10 h-10 items-center justify-center transition-all duration-200 hover:scale-105"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </button>

          <div ref={scrollerRef} className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 py-1">
            {deals.map((p, idx) => {
              const price = extractBestPrice(p);
              const old = extractOldPrice(p);
              const created = new Date(p.createdAt || Date.now());
              const daysAgo = Math.floor((Date.now() - created.getTime()) / (1000*60*60*24));
              const isFlash = daysAgo <= 7 && Number.isFinite(price);
              const badge = isFlash ? 'Flash Deal' : 'Super';

              return (
                <div
                  key={p._id || idx}
                  onClick={() => navigate(`/product-detail/${p._id}`)}
                  className="snap-start min-w-[160px] sm:min-w-[200px] lg:min-w-[220px] bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition"
                >
                  <div className="relative">
                    <img
                      src={p.images?.[0] || '/placeholder-image.jpg'}
                      alt={p.name}
                      className="w-full h-28 sm:h-36 object-cover rounded-lg"
                      onError={(e) => { e.currentTarget.src = '/placeholder-image.jpg'; }}
                    />
                    <div className={`absolute top-2 left-2 px-2.5 py-1 rounded text-[10px] font-semibold text-white shadow ${isFlash ? 'bg-orange-500' : 'bg-red-500'}`}>{badge}</div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-baseline gap-2 mb-1">
                      {Number.isFinite(price) ? (
                        <span className="text-orange-600 font-bold text-sm sm:text-base">{formatINR(price)}</span>
                      ) : (
                        <span className="text-gray-500 text-sm">Price on request</span>
                      )}
                      {old && (
                        <span className="text-gray-400 line-through text-xs sm:text-sm">{formatINR(old)}</span>
                      )}
                    </div>
                    {p.moq && (
                      <div className="text-[11px] sm:text-xs text-gray-600">MOQ: {p.moq}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopDeals;
