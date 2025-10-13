import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showMessage, setShowMessage] = useState('');
    const navigate = useNavigate();
    
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();

    if (!product) {
        return (
            <div className="product-card-skeleton">
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-line"></div>
                </div>
            </div>
        );
    }

    const {
        _id,
        name,
        price,
        priceRange,
        moq,
        images = [],
        videos = [],
        category,
        subcategory,
        description,
        sampleAvailable,
        samplePrice,
        customization,
        warranty,
        returnPolicy,
        hsCode,
        manufacturerId,
        createdAt
    } = product;

    const handleProductClick = (e) => {
        // Don't navigate if clicking on action buttons
        if (e.target.closest('.action-button')) {
            return;
        }
        navigate(`/product-detail/${_id}`);
    };

    const handleWishlistClick = async (e) => {
        e.stopPropagation();
        try {
            let result;
            if (isInWishlist(_id)) {
                result = await removeFromWishlist(_id);
            } else {
                result = await addToWishlist(product);
            }
            
            setShowMessage(result.message);
            setTimeout(() => setShowMessage(''), 2000);
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        }
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        try {
            const result = await addToCart(product, 1);
            setShowMessage(result.message);
            setTimeout(() => setShowMessage(''), 2000);
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price);
    };

    const mainImage = images[0] || '/placeholder-image.jpg';
    const isWishlisted = isInWishlist(_id);

    return (
        <div className="product-card-container">
            <div 
                className={`product-card ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleProductClick}
            >
                {/* Message Toast */}
                {showMessage && (
                    <div className="message-toast">
                        {showMessage}
                    </div>
                )}

                {/* Product Image */}
                <div className="product-image-container">
                    <img
                        src={mainImage}
                        alt={name}
                        className="product-image"
                        onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                        }}
                    />
                    
                    {/* Wishlist Button */}
                    <button 
                        className={`wishlist-btn action-button ${isWishlisted ? 'active' : ''}`}
                        onClick={handleWishlistClick}
                        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        <span className="material-symbols-outlined">
                            {isWishlisted ? 'favorite' : 'favorite_border'}
                        </span>
                    </button>


                    {/* Hover Overlay with Add to Cart */}
                    <div className="hover-overlay">
                        <button 
                            className="add-to-cart-btn action-button"
                            onClick={handleAddToCart}
                        >
                            <span className="material-symbols-outlined">shopping_cart</span>
                            <span className="add-to-cart-text">Add to Cart</span>
                        </button>
                    </div>
                </div>

                {/* Product Details */}
                <div className="product-details">
                    {/* Category */}
                    <div className="product-category">
                        {category} {subcategory && `• ${subcategory}`}
                    </div>

                    {/* Seller Information */}
                    {(product.sellerProfile || product.sellerInfo) && (
                        <div className="seller-info-card">
                            <Link 
                                to={`/seller/${product.sellerProfile?.sellerId || product.sellerInfo?.sellerId || product.sellerId}`}
                                className="seller-link"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span className="material-symbols-outlined seller-icon">store</span>
                                <span className="seller-name">
                                    {product.sellerProfile?.companyName || product.sellerInfo?.companyName || 'Seller'}
                                </span>
                                {(product.sellerProfile?.verified || product.sellerInfo?.verified) && (
                                    <span className="verified-icon material-symbols-outlined">verified</span>
                                )}
                            </Link>
                        </div>
                    )}

                    {/* Product Name */}
                    <h3 className="product-name" title={name}>
                        {name}
                    </h3>

                    {/* Price */}
                    <div className="product-price">
                        {price ? (
                            <span className="price-fixed">{formatPrice(price)}</span>
                        ) : priceRange ? (
                            <span className="price-range">
                                {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                            </span>
                        ) : (
                            <span className="price-request">Price on request</span>
                        )}
                    </div>

                    {/* MOQ */}
                    {moq && (
                        <div className="product-moq">
                            Min Order: {moq} pieces
                        </div>
                    )}

                    {/* Action Buttons Row */}
                    <div className="action-buttons-row">
                        <button 
                            className="quick-add-btn action-button"
                            onClick={handleAddToCart}
                            title="Add to Cart"
                        >
                            <span className="material-symbols-outlined">shopping_cart</span>
                        </button>
                        <button 
                            className="view-details-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/product-detail/${_id}`);
                            }}
                        >
                            <span className="view-details-text">View Details</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard