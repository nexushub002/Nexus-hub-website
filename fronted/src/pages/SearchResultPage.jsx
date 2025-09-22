import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ProductCart from "../components/ProductCard";
import "./SearchResultPage.css";

const SearchResultPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query) {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => setResults(data));
    }
  }, [query]);

  return (
    <div className="product-page">

      {/* Product Grid */}
      <section className="product-grid">
        {
          results.map((product) => (
            <ProductCart key={product._id} product={product} />
          ))
        }
      </section>
    </div>
  );
};

export default SearchResultPage;
