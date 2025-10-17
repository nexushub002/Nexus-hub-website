import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import SendInquiryModal from "../components/SendInquiryModal";
import "./ProductDetailsPage.css";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainIndex, setMainIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [wishlistMessage, setWishlistMessage] = useState('');
  const [cartMessage, setCartMessage] = useState('');
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart: addProductToCart } = useCart();

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const url1 = `${import.meta.env.VITE_API_BASE_URL}/api/products-new/public/${id}`;

        // Try new API first, fallback to old API
        let res = await fetch(url1);
        if (!res.ok) {
          // Fallback to old API

          const url2 = `${import.meta.env.VITE_API_BASE_URL}/api/product/${id}`;

          res = await fetch(url2);
        }
        if (!res.ok) {
          throw new Error('Product not found');
        }
        const data = await res.json();
        setProduct(data.success ? data.product : data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError(err.message);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleThumbClick = (idx) => setMainIndex(idx);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleWishlistToggle = async () => {
    if (!product) return;

    try {
      let result;
      let actionType;
      
      if (isInWishlist(product._id)) {
        result = await removeFromWishlist(product._id);
        actionType = 'removed';
      } else {
        result = await addToWishlist(product);
        actionType = 'added';
      }
      
      setWishlistMessage({ text: result.message, type: actionType });
      
      // Clear message after 1.5 seconds
      setTimeout(() => {
        setWishlistMessage('');
      }, 1500);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      setWishlistMessage({ text: 'Something went wrong. Please try again.', type: 'error' });
      setTimeout(() => {
        setWishlistMessage('');
      }, 1500);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      const result = await addProductToCart(product, 1);
      
      if (result.success) {
        setCartMessage({ text: result.message, type: 'added' });
      } else {
        setCartMessage({ text: result.message, type: 'error' });
      }
      
      // Clear message after 1.5 seconds
      setTimeout(() => {
        setCartMessage('');
      }, 1500);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCartMessage({ text: 'Something went wrong. Please try again.', type: 'error' });
      setTimeout(() => {
        setCartMessage('');
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <Navbar />
        <div className="error-container">
          <span className="material-symbols-outlined error-icon">error</span>
          <h3>Product not found</h3>
          <p>{error || 'The product you are looking for does not exist.'}</p>
        </div>
      </div>
    );
  }

  const {
    images = [],
    name,
    description,
    category,
    subcategory,
    price,
    priceRange,
    moq,
    sampleAvailable,
    samplePrice,
    warranty,
    returnPolicy,
    customization,
    hsCode,
    createdAt
  } = product;

  return (
    <div>
      <Navbar />
      <div className="product-details-container">
        {/* Image Gallery Section */}
        <div className="image-section">
          <div className="image-gallery-container">
            {/* Thumbnails Column */}
            <div className="thumbnails">
              {images.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`${name} ${idx + 1}`}
                  className={idx === mainIndex ? "thumb active" : "thumb"}
                  onClick={() => handleThumbClick(idx)}
                />
              ))}
            </div>
            
            {/* Main Image */}
            <div className="main-image-wrapper">
              <img
                src={images[mainIndex] || '/placeholder-image.jpg'}
                alt={name}
                className="main-image"
              />
              <div className="image-counter">
                {mainIndex + 1} / {images.length}
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Section */}
        <div className="info-section">
          {/* Product Header */}
          <div className="product-header">
            <div className="breadcrumb">
              <span>{category}</span>
              <span className="separator">›</span>
              <span>{subcategory}</span>
            </div>
            <h1 className="product-title">{name}</h1>
            <div className="product-meta">
              <span className="product-id">Product ID: {id}</span>
              <span className="listed-date">Listed on {formatDate(createdAt)}</span>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="pricing-section">
            <div className="main-price">
              <span className="price-label">Price:</span>
              <span className="price-value">{formatPrice(price)}</span>
            </div>
            {priceRange && priceRange.min && priceRange.max && (
              <div className="price-range">
                <span className="range-label">Price Range:</span>
                <span className="range-value">
                  {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                </span>
              </div>
            )}
            <div className="moq-info">
              <span className="moq-label">Minimum Order Quantity:</span>
              <span className="moq-value">{moq} pieces</span>
            </div>
          </div>

          {/* Sample Information */}
          {sampleAvailable && (
            <div className="sample-section">
              <div className="sample-badge">
                <span className="material-symbols-outlined">science</span>
                Sample Available
              </div>
              {samplePrice && (
                <div className="sample-price">
                  Sample Price: {formatPrice(samplePrice)}
                </div>
              )}
            </div>
          )}

          {/* Seller Information */}
          {(product.sellerInfo || product.sellerProfile) && (
            <div className="seller-section">
              <h3>Seller Information</h3>
              <div className="seller-card">
                <div className="seller-header">
                  {(product.sellerInfo?.companyLogo?.url || product.sellerProfile?.companyLogo?.url) && (
                    <img 
                      src={product.sellerInfo?.companyLogo?.url || product.sellerProfile?.companyLogo?.url} 
                      alt="Company Logo" 
                      className="seller-logo"
                    />
                  )}
                  <div className="seller-details">
                    <h4>{product.sellerInfo?.companyName || product.sellerProfile?.companyName}</h4>
                    <div className="seller-meta">
                      <span className="seller-id">
                        Seller ID: {product.sellerInfo?.sellerId || product.sellerProfile?.sellerId || product.sellerId}
                      </span>
                      {(product.sellerInfo?.verified || product.sellerProfile?.verified) && (
                        <span className="verified-badge">
                          <span className="material-symbols-outlined">verified</span>
                          Verified Seller
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="seller-stats">
                  <div className="stat-item">
                    <span className="stat-value">{product.sellerInfo?.totalProducts || 'N/A'}</span>
                    <span className="stat-label">Total Products</span>
                  </div>
                  {(product.sellerInfo?.yearOfEstablishment || product.sellerProfile?.yearOfEstablishment) && (
                    <div className="stat-item">
                      <span className="stat-value">{product.sellerInfo?.yearOfEstablishment || product.sellerProfile?.yearOfEstablishment}</span>
                      <span className="stat-label">Established</span>
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="seller-contact">
                  <h5>Contact Information</h5>
                  <div className="contact-details">
                    <div className="contact-item">
                      <span className="material-symbols-outlined">phone</span>
                      <span>{product.sellerInfo?.contactPerson?.phone || product.sellerProfile?.contactPerson?.phone || product.sellerInfo?.phone || product.sellerProfile?.phone || 'Not available'}</span>
                    </div>
                    <div className="contact-item">
                      <span className="material-symbols-outlined">email</span>
                      <span>{product.sellerInfo?.contactPerson?.email || product.sellerProfile?.contactPerson?.email || product.sellerInfo?.email || product.sellerProfile?.email || 'Not available'}</span>
                    </div>
                  </div>
                </div>

                {(product.sellerInfo?.aboutCompany || product.sellerProfile?.aboutCompany) && (
                  <div className="seller-description">
                    <p>{product.sellerInfo?.aboutCompany || product.sellerProfile?.aboutCompany}</p>
                  </div>
                )}

                <div className="seller-actions">
                  <Link 
                    to={`/seller/${product.sellerInfo?.sellerId || product.sellerProfile?.sellerId || product.sellerId}`}
                    className="btn-outline"
                  >
                    <span className="material-symbols-outlined">store</span>
                    View Seller Profile
                  </Link>
                  <Link 
                    to={`/seller/${product.sellerInfo?.sellerId || product.sellerProfile?.sellerId || product.sellerId}`}
                    className="btn-outline"
                  >
                    <span className="material-symbols-outlined">inventory_2</span>
                    View All Products
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Key Features */}
          <div className="features-section">
            <h3>Key Features</h3>
            <div className="features-grid">
              <div className="feature-item">
                <span className="material-symbols-outlined">verified</span>
                <div>
                  <strong>Customization</strong>
                  <p>{customization ? 'Available' : 'Not Available'}</p>
                </div>
              </div>
              {warranty && (
                <div className="feature-item">
                  <span className="material-symbols-outlined">shield</span>
                  <div>
                    <strong>Warranty</strong>
                    <p>{warranty}</p>
                  </div>
                </div>
              )}
              {returnPolicy && (
                <div className="feature-item">
                  <span className="material-symbols-outlined">keyboard_return</span>
                  <div>
                    <strong>Return Policy</strong>
                    <p>{returnPolicy}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Wishlist Message */}
          {wishlistMessage && (
            <div className={`wishlist-message ${wishlistMessage.type || 'added'}`}>
              <span className="material-symbols-outlined">
                {wishlistMessage.type === 'removed' ? 'heart_broken' : 'favorite'}
              </span>
              {wishlistMessage.text || wishlistMessage}
            </div>
          )}

          {/* Cart Message */}
          {cartMessage && (
            <div className={`wishlist-message ${cartMessage.type || 'added'}`}>
              <span className="material-symbols-outlined">
                {cartMessage.type === 'error' ? 'error' : 'shopping_cart'}
              </span>
              {cartMessage.text || cartMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="btn-primary"
              onClick={() => setIsInquiryModalOpen(true)}
              style={{ backgroundColor: '#ff6b35' }}
            >
              <span className="material-symbols-outlined">mail</span>
              Send Inquiry
            </button>
            <button className="btn-primary" onClick={handleAddToCart}>
              <span className="material-symbols-outlined">shopping_cart</span>
              Add to Cart
            </button>
            <button 
              className={`btn-secondary ${isInWishlist(product._id) ? 'in-wishlist' : ''}`}
              onClick={handleWishlistToggle}
            >
              <span className="material-symbols-outlined">
                {isInWishlist(product._id) ? 'favorite' : 'favorite_border'}
              </span>
              {isInWishlist(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
            <button className="btn-secondary">
              <span className="material-symbols-outlined">share</span>
              Share Product
            </button>
          </div>

          {/* Detailed Information Tabs */}
          <div className="details-tabs">
            <div className="tab-headers">
              <button
                className={activeTab === 'description' ? 'tab-header active' : 'tab-header'}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                className={activeTab === 'specifications' ? 'tab-header active' : 'tab-header'}
                onClick={() => setActiveTab('specifications')}
              >
                Specifications
              </button>
              <button
                className={activeTab === 'shipping' ? 'tab-header active' : 'tab-header'}
                onClick={() => setActiveTab('shipping')}
              >
                Shipping & Returns
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'description' && (
                <div className="tab-panel">
                  <h4>Product Description</h4>
                  <p>{description || 'No description available for this product.'}</p>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="tab-panel">
                  <h4>Product Specifications</h4>
                  <div className="specs-table">
                    <div className="spec-row">
                      <span className="spec-label">Category:</span>
                      <span className="spec-value">{category}</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">Subcategory:</span>
                      <span className="spec-value">{subcategory}</span>
                    </div>
                    {hsCode && (
                      <div className="spec-row">
                        <span className="spec-label">HS Code:</span>
                        <span className="spec-value">{hsCode}</span>
                      </div>
                    )}
                    <div className="spec-row">
                      <span className="spec-label">Minimum Order:</span>
                      <span className="spec-value">{moq} pieces</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">Customization:</span>
                      <span className="spec-value">{customization ? 'Available' : 'Not Available'}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="tab-panel">
                  <h4>Shipping & Returns</h4>
                  <div className="shipping-info">
                    {returnPolicy && (
                      <div className="shipping-item">
                        <span className="material-symbols-outlined">keyboard_return</span>
                        <div>
                          <strong>Return Policy</strong>
                          <p>{returnPolicy}</p>
                        </div>
                      </div>
                    )}
                    {warranty && (
                      <div className="shipping-item">
                        <span className="material-symbols-outlined">shield</span>
                        <div>
                          <strong>Warranty</strong>
                          <p>{warranty}</p>
                        </div>
                      </div>
                    )}
                    <div className="shipping-item">
                      <span className="material-symbols-outlined">local_shipping</span>
                      <div>
                        <strong>Shipping</strong>
                        <p>Contact seller for shipping details and charges.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Send Inquiry Modal */}
        <SendInquiryModal
          isOpen={isInquiryModalOpen}
          onClose={() => setIsInquiryModalOpen(false)}
          product={product}
          sellerInfo={product?.sellerInfo || product?.sellerProfile}
        />
      </div>
    </div>
  );
};

export default ProductDetailsPage;
