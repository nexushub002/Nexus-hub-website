import React from 'react';
import { useCart } from '../context/CartContext';
import './CartPanel.css';

const CartPanel = () => {
  const {
    cartItems,
    loading,
    isCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartCount,
    getCartTotal,
    closeCart
  } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(productId);
    } else {
      await updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = async (productId) => {
    await removeFromCart(productId);
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="cart-backdrop" onClick={closeCart}></div>
      
      {/* Cart Panel */}
      <div className={`cart-panel ${isCartOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="cart-header">
          <h2>
            <span className="material-symbols-outlined">shopping_cart</span>
            Shopping Cart ({getCartCount()})
          </h2>
          <button className="close-btn" onClick={closeCart}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="cart-content">
          {loading && (
            <div className="cart-loading">
              <div className="loading-spinner"></div>
              <p>Updating cart...</p>
            </div>
          )}

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <span className="material-symbols-outlined">shopping_cart</span>
              <h3>Your cart is empty</h3>
              <p>Add some products to get started!</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item._id} className="cart-item">
                    <div className="item-image">
                      <img 
                        src={item.images?.[0] || '/placeholder-image.jpg'} 
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>
                    
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p className="item-category">{item.category} • {item.subcategory}</p>
                      <div className="item-price">
                        {item.price ? (
                          <span className="price">{formatPrice(item.price)}</span>
                        ) : item.priceRange ? (
                          <span className="price-range">
                            {formatPrice(item.priceRange.min)} - {formatPrice(item.priceRange.max)}
                          </span>
                        ) : (
                          <span className="price-na">Price on request</span>
                        )}
                      </div>
                    </div>

                    <div className="item-actions">
                      <div className="quantity-controls">
                        <button 
                          className="qty-btn"
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          disabled={loading}
                        >
                          <span className="material-symbols-outlined">remove</span>
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          disabled={loading}
                        >
                          <span className="material-symbols-outlined">add</span>
                        </button>
                      </div>
                      
                      <button 
                        className="remove-btn"
                        onClick={() => handleRemoveItem(item._id)}
                        disabled={loading}
                        title="Remove from cart"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Total Items:</span>
                  <span>{getCartCount()}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount:</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>
              </div>

              {/* Cart Actions */}
              <div className="cart-actions">
                <button 
                  className="clear-cart-btn"
                  onClick={handleClearCart}
                  disabled={loading}
                >
                  <span className="material-symbols-outlined">delete_sweep</span>
                  Clear Cart
                </button>
                <button className="checkout-btn" disabled={loading}>
                  <span className="material-symbols-outlined">payment</span>
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartPanel;
