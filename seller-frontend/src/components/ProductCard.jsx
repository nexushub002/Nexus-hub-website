import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const [showMessage, setShowMessage] = useState('');
    const navigate = useNavigate();

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

    const handleProductClick = () => {
        navigate(`/product-detail/${_id}`);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price);
    };

    const mainImage = images[0] || '/placeholder-image.jpg';

    return (
        <div className="product-card-container">
            <div className="product-card" onClick={handleProductClick}>
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
                </div>

                {/* Product Details */}
                <div className="product-details">
                    {/* Product Name */}
                    <h3 className="font-semibold text-lg mb-2 truncate">{product.name}</h3>

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
                </div>
            </div>
        </div>
    );
};

export default ProductCard