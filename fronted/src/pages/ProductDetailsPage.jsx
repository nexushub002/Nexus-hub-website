// src/components/ProductDetailsPage.jsx
import React, { useState, useEffect } from "react";
// import { useCart } from "../context/CartContext";
import { useParams } from "react-router-dom";
// import AddToCartButton from "../Component/AddToCartButton";
// import "./ProductDetailsPage.css";

const ProductDetailsPage = () => {
  const { id } = useParams();
  console.log("Product ID from URL:", id);

  const [product, setProduct] = useState(null);
  const [mainIndex, setMainIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // const { addToCart } = useCart();

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/product/${id}`);
        const data = await res.json();
        console.log(data);
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setProduct(null); // ensure re-render
      }
    };
    fetchProduct();
  }, [id]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!product) {
    return (
      <div className="loading">
        <h1> some moment wait please.....</h1>
      </div>
    );
  }


  const { images = [], name, description, priceRange, moq, sampleAvailable, samplePrice, warranty, customization } = product;

  // Image logic
  const handleThumbClick = (idx) => setMainIndex(idx);

  return (
    <div className="product-details-container" style={{ display: isMobile ? "block" : "flex" }}>
      {/* Left Image Section */}
      <div className="image-section">
        {!isMobile ? (
          <>
            {/* Desktop View */}
            <div className="thumbnails">
              {images.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`${name} ${idx}`}
                  className={idx === mainIndex ? "thumb active" : "thumb"}
                  onClick={() => handleThumbClick(idx)}
                />
              ))}
            </div>
            <div className="main-image-wrapper">
              <img
                src={images[mainIndex]}
                alt={name}
                className="main-image"
              />
            </div>
          </>
        ) : (
          <>
            {/* Mobile View */}
            <div className="slider-wrapper">
              <div className="slider-track" style={{transform: `translateX(-${mainIndex * 100}%)` }}>
                {images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Slide ${i}`}
                    className="slide-image mobile-img"
                  />
                ))}
              </div>
              <div className="slider-dots">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`dot ${i === mainIndex ? "active" : ""}`}
                    onClick={() => handleThumbClick(i)}
                  ></span>
                ))}
              </div>
              
              <div className="mobile-thumbnails">
                {images.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`${name} ${idx}`}
                    className={idx === mainIndex ? "thumb active" : "thumb"}
                    onClick={() => handleThumbClick(idx)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
        
      </div>

      {/* Right Info Section */}
      <div className="info-section">
        <h1 className="pd-title">{name}</h1>
        <div className="pd-rating">
          {"★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating))}
        </div>
        <div className="pd-price">
          <strong>MRP</strong>
          <span className="old">₹{oldPrice}</span>
          <span className="new">₹{price}</span>
          {discount && <span className="disc">{discount}</span>}
        </div>
        <p className="pd-description">{description}</p>
        {/* You can add buttons like "Add to Cart" and "Wishlist" here */}
        <div>
          <p>{product._id}</p>
          <p>{product.title}</p>
        </div>
        <AddToCartButton product={product}/>
      </div>
    </div>
  );
};

export default ProductDetailsPage;