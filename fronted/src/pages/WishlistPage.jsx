import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useWishlist } from '../context/WishlistContext';
import './WishlistPage.css';

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist, loading } = useWishlist();
  const navigate = useNavigate();

  const handleProductClick = (productId) => {
    navigate(`/product-detail/${productId}`);
  };

  const handleRemoveItem = async (productId, productName) => {
    try {
      const result = await removeFromWishlist(productId);
      if (result.success) {
        console.log(`${productName} removed from wishlist`);
      } else {
        console.error('Failed to remove item:', result.message);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="wishlist-loading">
          <div className="loading-spinner"></div>
          <p>Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1 className="wishlist-title">
            <span className="material-symbols-outlined">favorite</span>
            My Wishlist
          </h1>
          <div className="wishlist-meta">
            <span className="wishlist-count">{wishlistItems.length} items</span>
            {wishlistItems.length > 0 && (
              <button 
                className="clear-wishlist-btn"
                onClick={async () => {
                  try {
                    await clearWishlist();
                  } catch (error) {
                    console.error('Error clearing wishlist:', error);
                  }
                }}
              >
                <span className="material-symbols-outlined">delete</span>
                Clear All
              </button>
            )}
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist">
            <span className="material-symbols-outlined empty-icon">favorite_border</span>
            <h3>Your wishlist is empty</h3>
            <p>Save items you love to your wishlist. Review them anytime and easily move them to your cart.</p>
            <button 
              className="continue-shopping-btn"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((item) => (
              <div key={item._id} className="wishlist-item">
                <div className="wishlist-item-image" onClick={() => handleProductClick(item._id)}>
                  <img
                    src={item.images?.[0] || '/placeholder-image.jpg'}
                    alt={item.name}
                    className="product-image"
                  />
                  <div className="image-overlay">
                    <span className="material-symbols-outlined">visibility</span>
                  </div>
                </div>

                <div className="wishlist-item-details">
                  <div className="item-header">
                    <h3 
                      className="item-title"
                      onClick={() => handleProductClick(item._id)}
                    >
                      {item.name}
                    </h3>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item._id, item.name)}
                      title="Remove from wishlist"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  <div className="item-category">
                    <span>{item.category}</span>
                    {item.subcategory && (
                      <>
                        <span className="separator">›</span>
                        <span>{item.subcategory}</span>
                      </>
                    )}
                  </div>

                  <div className="item-price">
                    {item.priceRange ? (
                      <span className="price-range">
                        {formatPrice(item.priceRange.min)} - {formatPrice(item.priceRange.max)}
                      </span>
                    ) : (
                      <span className="single-price">
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>

                  {item.moq && (
                    <div className="item-moq">
                      MOQ: {item.moq} pieces
                    </div>
                  )}

                  <div className="item-added-date">
                    Added on {formatDate(item.addedAt)}
                  </div>

                  <div className="item-actions">
                    <button
                      className="view-product-btn"
                      onClick={() => handleProductClick(item._id)}
                    >
                      <span className="material-symbols-outlined">visibility</span>
                      View Product
                    </button>
                    <button
                      className="add-to-cart-btn"
                      onClick={() => {
                        // Add to cart functionality can be implemented here
                        console.log('Add to cart:', item.name);
                      }}
                    >
                      <span className="material-symbols-outlined">shopping_cart</span>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
