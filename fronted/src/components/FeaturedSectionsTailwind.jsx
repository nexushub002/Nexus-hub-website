import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { buildApiUrl } from '../config/api';

const FeaturedSectionsTailwind = () => {
  const [topRankingProducts, setTopRankingProducts] = useState([]);
  const [newArrivalsProducts, setNewArrivalsProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const url = buildApiUrl('/api/showAllProducts');
        
        // Fetch all products from your API
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const allProducts = await response.json();
        
        // Process products for Top Ranking (most recent or popular products)
        const topRanking = allProducts
          .slice(0, 3) // Get first 3 products
          .map((product, index) => ({
            ...product,
            ranking: index + 1,
            badge: 'TOP',
            hotSelling: true // You can add logic to determine this
          }));
        
        // Process products for New Arrivals (most recently created)
        const newArrivals = allProducts
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by newest first
          .slice(0, 3) // Get 3 newest products
          .map((product) => {
            const createdDate = new Date(product.createdAt);
            const now = new Date();
            const daysAgo = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
            
            return {
              ...product,
              isNew: true,
              daysAgo: daysAgo,
              listedInLast60Days: daysAgo <= 60
            };
          });
        
        setTopRankingProducts(topRanking);
        setNewArrivalsProducts(newArrivals);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/product-detail/${productId}`);
  };

  const handleWishlistClick = async (e, product) => {
    e.stopPropagation();
    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    try {
      await addToCart(product, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatPriceRange = (priceRange) => {
    if (!priceRange || !priceRange.min || !priceRange.max) return null;
    return `${formatPrice(priceRange.min)} - ${formatPrice(priceRange.max)}`;
  };

  const getDisplayPrice = (product) => {
    if (product.price && product.price > 0) {
      return formatPrice(product.price);
    } else if (product.priceRange && product.priceRange.min && product.priceRange.max) {
      return formatPriceRange(product.priceRange);
    } else {
      return 'Price on request';
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8 bg-white">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Top Ranking Loading */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="h-7 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                  <div className="h-40 bg-gray-200 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Arrivals Loading */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="h-7 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                  <div className="h-40 bg-gray-200 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8 bg-white">
        <div className="text-center text-red-500 font-medium">
          Error loading featured sections: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 bg-white">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Top Ranking Section */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Top Ranking</h2>
              <p className="text-sm text-gray-600">Navigate trends with data-driven rankings</p>
            </div>
            <button 
              onClick={() => navigate('/top-ranking')}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg text-gray-700 font-medium text-sm hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all duration-300 group"
            >
              <span>View more</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {topRankingProducts.map((product) => (
              <div 
                key={product._id} 
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300"
                onClick={() => handleProductClick(product._id)}
              >
                <div className="relative">
                  {/* TOP Badge */}
                  <div className="absolute top-2 left-2 z-10 bg-black text-white px-2 py-1 rounded text-xs font-bold">
                    TOP
                  </div>
                  
                  <img
                    src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg'}
                    alt={product.name}
                    className="w-full h-24 sm:h-28 lg:h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>

                <div className="p-3">
                  <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                  
                  {/* Hot selling label */}
                  <div className="text-red-500 text-xs font-medium mb-2">
                    Hot selling
                  </div>
                  
                  {product.moq && (
                    <div className="text-gray-600 text-xs">
                      MOQ: {product.moq}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Arrivals Section */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">New Arrivals</h2>
              <p className="text-sm text-gray-600">Stay ahead with the latest offerings</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {newArrivalsProducts.map((product) => (
              <div 
                key={product._id} 
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300"
                onClick={() => handleProductClick(product._id)}
              >
                <div className="relative">
                  {/* NEW BADGE - only show for first product or recent ones */}
                  {product.daysAgo <= 1 && (
                    <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                      NEW
                    </div>
                  )}
                  
                  <img
                    src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg'}
                    alt={product.name}
                    className="w-full h-24 sm:h-28 lg:h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>

                <div className="p-3">
                  <div className="mb-2">
                    <span className="text-gray-900 font-semibold text-sm">
                      {getDisplayPrice(product)}
                    </span>
                  </div>
                  
                  {product.moq && (
                    <div className="text-gray-600 text-xs mb-2">
                      MOQ: {product.moq}
                    </div>
                  )}
                  
                  {/* Listed in last 60 days - show for last product */}
                  {product.listedInLast60Days && product.daysAgo <= 60 && (
                    <div className="text-purple-600 text-xs font-medium">
                      Listed in last 60 days
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedSectionsTailwind;
