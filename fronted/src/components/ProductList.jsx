// src/pages/ProductList.jsx
import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch data from backend API
    fetch("http://localhost:3000/api/showAllProducts")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  return (
  <div className="flex justify-center items-center w-full my-8">

<div className=" grid grid-cols-5 gap-4 p-4 m-auto ">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  </div>
  );
};

export default ProductList;