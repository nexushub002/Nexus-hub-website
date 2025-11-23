import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ProductCart from "../components/ProductCard";
import Navbar from "../components/Navbar";
import "./SearchResultPage.css";
import { buildApiUrl } from "../config/api";

const SearchResultPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query) {
      setLoading(true);
      setError(null);

      const url = buildApiUrl(`/api/search?q=${encodeURIComponent(query)}`);

      fetch(url)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Search failed');
          }
          return res.json();
        })
        .then((data) => {
          setResults(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [query]);

  return (
    <div>
      <Navbar />
      <div className="search-results-container">
        {/* Search Header */}
        <div className="search-header">
          <div className="search-info">
            <h1 className="search-title">
              {query ? `Search results for "${query}"` : 'Search Results'}
            </h1>
            {!loading && results.length > 0 && (
              <p className="search-count">
                {results.length} product{results.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Searching for products...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-container">
            <span className="material-symbols-outlined error-icon">error</span>
            <h3>Something went wrong</h3>
            <p>{error}</p>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && results.length === 0 && query && (
          <div className="no-results-container">
            <span className="material-symbols-outlined no-results-icon">search_off</span>
            <h3>No products found</h3>
            <p>We couldn't find any products matching "{query}"</p>
            <div className="search-suggestions">
              <h4>Try:</h4>
              <ul>
                <li>Checking your spelling</li>
                <li>Using different keywords</li>
                <li>Searching for more general terms</li>
              </ul>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && results.length > 0 && (
          <section className="product-grid">
            {results.map((product) => (
              <ProductCart key={product._id} product={product} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default SearchResultPage;
