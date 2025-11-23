// src/components/ProductList.jsx
import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import "./ProductCard.css"; // Import the CSS for grid layout
import { buildApiUrl } from '../config/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from backend API
    setLoading(true);

    const url = buildApiUrl('/api/showAllProducts');

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch products');
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center w-full my-8 p-8">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error loading products
          </div>
          <div className="text-gray-600">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center w-full my-8 p-8">
        <div className="text-center">
          <div className="text-gray-500 text-lg font-semibold mb-2">
            No products found
          </div>
          <div className="text-gray-400">Check back later for new products</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-1">
      <div className="products grid grid-cols-2 md:grid-cols-4 gap-2">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;