import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const FeaturedSectionsImproved = () => {
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
        
        const url = `${import.meta.env.VITE_API_BASE_URL}/api/showAllProducts`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const allProducts = await response.json();
        
        // Process products for Top Ranking
        const topRanking = allProducts
          .slice(0, 6) // Get 6 products for optimal layout
          .map((product, index) => ({
            ...product,
            ranking: index + 1,
            badge: 'TOP',
            hotSelling: true
          }));
        
        // Process products for New Arrivals
        const newArrivals = allProducts
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 6) // Get 6 newest products
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
      <div className="w-full bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Loading skeletons */}
            {Array.from({ length: 2 }).map((_, sectionIndex) => (
              <div key={sectionIndex} className="bg-white rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <div className="h-7 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="h-28 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load featured sections</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Top Ranking Section */}
          <div className="bg-white rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Top Ranking</h2>
                <p className="text-sm text-gray-600">Navigate trends with data-driven rankings</p>
              </div>
              <button 
                onClick={() => navigate('/top-ranking')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                <span>View more</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {topRankingProducts.map((product, index) => (
                <div 
                  key={product._id} 
                  className="group bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-200"
                  onClick={() => handleProductClick(product._id)}
                >
                  <div className="relative mb-3">
                    {/* Simple TOP Badge */}
                    <div className="absolute top-2 left-2 z-10 bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium">
                      TOP
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      <img
                        src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg'}
                        alt={product.name}
                        className="w-full h-28 object-contain p-2"
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <div className="text-red-600 text-xs font-medium">
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
          <div className="bg-white rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">New Arrivals</h2>
                <p className="text-sm text-gray-600">Stay ahead with the latest offerings</p>
              </div>
              <button 
                onClick={() => navigate('/new-arrivals')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                <span>View more</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {newArrivalsProducts.map((product, index) => (
                <div 
                  key={product._id} 
                  className="group bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-200"
                  onClick={() => handleProductClick(product._id)}
                >
                  <div className="relative mb-3">
                    {/* Simple NEW Badge */}
                    {product.daysAgo <= 7 && (
                      <div className="absolute top-2 right-2 z-10 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                        NEW
                      </div>
                    )}
                    
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      <img
                        src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg'}
                        alt={product.name}
                        className="w-full h-28 object-contain p-2"
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <div className="text-lg font-semibold text-gray-900">
                      {getDisplayPrice(product)}
                    </div>
                    
                    {product.moq && (
                      <div className="text-gray-600 text-xs">
                        MOQ: {product.moq}
                      </div>
                    )}
                    
                    {product.listedInLast60Days && product.daysAgo <= 60 && (
                      <div className="text-green-600 text-xs font-medium">
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
    </div>
  );
};

export default FeaturedSectionsImproved;
