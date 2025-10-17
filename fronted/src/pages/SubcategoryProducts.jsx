import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';

const SubcategoryProducts = () => {
  const { categoryKey, subcategoryKey } = useParams();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {

        const url = `${import.meta.env.VITE_API_BASE_URL}/api/products/by-keys?categoryKey=${categoryKey}&subcategoryKey=${subcategoryKey}&page=${page}&limit=24`;
        
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok || data.success === false) {
          throw new Error(data.message || 'Failed to fetch');
        }
        setItems(data.items || []);
      } catch (e) {
        setError(e.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [categoryKey, subcategoryKey, page]);

  const titleize = (s) => (s || '').replace(/_/g, ' ');

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.08),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.08),transparent_40%)]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h1 className="text-xl md:text-2xl font-bold">
            {titleize(categoryKey)} • {titleize(subcategoryKey)}
          </h1>
          <p className="text-gray-600">Browse products in this subcategory</p>
        </div>

        {error && (
          <div className="mb-4 text-sm px-4 py-2 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
        )}

        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCard key={`skeleton-${i}`} product={null} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-600">
            <div className="text-6xl mb-3">🛍️</div>
            <div className="font-medium mb-1">No products found</div>
            <div className="text-sm">Try a different subcategory</div>
          </div>
        ) : (
          <div className="products-grid">
            {items.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubcategoryProducts;
