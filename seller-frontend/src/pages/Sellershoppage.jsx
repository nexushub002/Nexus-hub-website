import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const Sellershoppage = () => {
  const { shopName, sellerId } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState(null);

  const buyerAppBaseUrl = useMemo(() => {
    const envUrl = (import.meta.env.VITE_FRONTED_URL || '').trim();
    if (envUrl) return envUrl.replace(/\/$/, '');
    if (typeof window !== 'undefined') {
      const { protocol, hostname } = window.location;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `${protocol}//${hostname}:5173`;
      }
      if (hostname.includes('vercel.app')) {
        return `https://nexus-hub-fronted.vercel.app`;
      }
    }
    return 'https://nexus-hub-fronted.vercel.app';
  }, []);

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!sellerId) {
        setError('Seller ID is missing from the URL.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const profileUrl = `${import.meta.env.VITE_API_BASE_URL}/api/seller-profile/public/${sellerId}`;
        const productsUrl = `${import.meta.env.VITE_API_BASE_URL}/api/seller-profile/products/${sellerId}?limit=100`;

        const [profileResponse, productsResponse] = await Promise.all([
          fetch(profileUrl),
          fetch(productsUrl),
        ]);

        const profileData = await profileResponse.json();
        const productsData = await productsResponse.json();

        if (profileResponse.ok && profileData.success) {
          setSeller(profileData.seller);
        } else {
          throw new Error(profileData.message || 'Seller not found.');
        }

        if (productsResponse.ok && productsData.success) {
          setProducts(productsData.products || []);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Error loading seller shop:', err);
        setError(err.message || 'Unable to load seller shop.');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerId]);

  const bannerImages = useMemo(
    () => (seller?.websiteBanners || []).filter((banner) => banner?.url),
    [seller?.websiteBanners]
  );

  useEffect(() => {
    if (bannerImages.length <= 1) return;
    const timer = setInterval(
      () => setCurrentBanner((prev) => (prev + 1) % bannerImages.length),
      3000
    );
    return () => clearInterval(timer);
  }, [bannerImages.length]);

  useEffect(() => {
    setCurrentBanner(0);
  }, [bannerImages.length]);

  const goToPrev = () => {
    if (!bannerImages.length) return;
    setCurrentBanner((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  const goToNext = () => {
    if (!bannerImages.length) return;
    setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
  };

  const openProductDetails = (productId) => {
    window.open(`${buyerAppBaseUrl}/product-detail/${productId}`, '_blank', 'noopener,noreferrer');
  };

  const handleProductKeyDown = (event, productId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openProductDetails(productId);
    }
  };

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];
    return cats;
  }, [products]);

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.subcategory?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  // Get factory videos from factoryVideos array and documents
  const factoryVideos = useMemo(() => {
    const videos = [];
    
    // Add factory videos from dedicated factoryVideos array
    if (seller?.factoryVideos && Array.isArray(seller.factoryVideos)) {
      seller.factoryVideos.forEach(video => {
        if (video?.url) {
          videos.push({
            url: video.url,
            originalName: video.originalName || 'Factory Video',
            format: video.format || 'video',
            uploadedAt: video.uploadedAt
          });
        }
      });
    }
    
    // Add videos from documents (for backward compatibility)
    if (seller?.documents) {
      const docVideos = seller.documents.filter(doc => 
        doc.resourceType === 'video' || 
        doc.format === 'mp4' || 
        doc.format === 'mov' ||
        doc.originalName?.toLowerCase().includes('factory') ||
        doc.originalName?.toLowerCase().includes('video')
      );
      videos.push(...docVideos);
    }
    
    return videos;
  }, [seller?.factoryVideos, seller?.documents]);

  // Get certificates
  const certificates = useMemo(() => {
    return seller?.certificates || [];
  }, [seller?.certificates]);

  // Open section in new page
  const openSectionPage = (section, data) => {
    const params = new URLSearchParams({
      sellerId: sellerId || '',
      shopName: shopName || seller?.shopName || '',
      section: section
    });
    
    if (data) {
      params.set('data', JSON.stringify(data));
    }
    
    const currentOrigin = window.location.origin;
    window.open(`${currentOrigin}/shop-section?${params.toString()}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading shop...</p>
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800 px-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Shop unavailable</h1>
          <p className="text-gray-600">{error || 'Seller not found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navigation Menu */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Home
              </Link>
              <button 
                onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Products
              </button>
              <button 
                onClick={() => navigate(`/company-profile/${sellerId}`)}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Company Profile
              </button>
              <button 
                onClick={() => document.getElementById('new-trends-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                New Trends
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Contact Seller
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Banner Section */}
      {bannerImages.length > 0 && (
        <section className="mb-8" id="home-section">
          <div className="relative h-64 sm:h-72 md:h-[460px] w-full overflow-hidden bg-gray-200">
            {bannerImages.map((banner, index) => (
              <img
                key={banner._id || banner.url}
                src={banner.url}
                alt={`Banner ${index + 1}`}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  index === currentBanner ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6 text-white drop-shadow-lg max-w-5xl mx-auto px-4">
              <p className="text-xs md:text-sm uppercase tracking-[0.35em] text-white/70">Featured</p>
              <h2 className="text-2xl md:text-4xl font-semibold capitalize">
                {seller.shopName || seller.companyName || 'Our Store'}
              </h2>
              <p className="text-sm md:text-base text-white/80 mt-2 max-w-2xl">
                Premium selections curated directly from {seller.companyName || 'our manufacturing unit'}.
              </p>
            </div>
            {bannerImages.length > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  aria-label="Previous banner"
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow"
                >
                  ‹
                </button>
                <button
                  onClick={goToNext}
                  aria-label="Next banner"
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow"
                >
                  ›
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {bannerImages.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-2 w-2 rounded-full ${idx === currentBanner ? 'bg-white' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-10">
        {/* New Trends Section
        <section id="new-trends-section" className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">New Trends & Innovations</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-white text-2xl">eco</span>
                </div>
                <h3 className="font-semibold mb-2">Sustainable Products</h3>
                <p className="text-gray-600 text-sm">Eco-friendly manufacturing processes and sustainable materials</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-white text-2xl">precision_manufacturing</span>
                </div>
                <h3 className="font-semibold mb-2">Advanced Technology</h3>
                <p className="text-gray-600 text-sm">State-of-the-art production facilities and quality control</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-white text-2xl">local_shipping</span>
                </div>
                <h3 className="font-semibold mb-2">Global Supply Chain</h3>
                <p className="text-gray-600 text-sm">Efficient logistics and worldwide distribution network</p>
              </div>
            </div>
          </div>
        </section>  */}

        {/* Products Section */}
        <section id="products-section">
        {/* Seller Information Row */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              {seller.companyLogo?.url && (
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                  <img
                    src={seller.companyLogo.url}
                    alt={seller.companyName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold capitalize">
                  {seller.shopName || shopName || seller.companyName || 'Seller Shop'}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  {seller.companyAddress && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      {seller.companyAddress.split(',')[seller.companyAddress.split(',').length - 1]?.trim() || seller.companyAddress}
                    </span>
                  )}
                  {seller.verified && (
                    <span className="flex items-center gap-1 text-green-600">
                      <span className="material-symbols-outlined text-base">verified</span>
                      Verified Seller
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-800">{products.length}</div>
                <div className="text-gray-500">Products</div>
              </div>
              {seller.yearOfEstablishment && (
                <div className="text-center">
                  <div className="font-semibold text-gray-800">{seller.yearOfEstablishment}</div>
                  <div className="text-gray-500">Established</div>
                </div>
              )}
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                onClick={() => {
                  window.open(`${buyerAppBaseUrl}/product-detail?contact=${sellerId}`, '_blank');
                }}
              >
                <span className="material-symbols-outlined text-base">mail</span>
                Contact
              </button>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Optimized */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-5 sticky top-4">
              {/* Categories/Filter Section - Most Important */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Filter by Category</h3>
                <div className="space-y-0.5">
                  {categories.map((cat) => {
                    const count = cat === 'all' ? products.length : products.filter(p => p.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${
                          selectedCategory === cat
                            ? 'bg-blue-600 text-white font-medium shadow-sm'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="capitalize">{cat === 'all' ? 'All items' : cat}</span>
                          <span className={`text-xs ${selectedCategory === cat ? 'text-blue-100' : 'text-gray-400'}`}>
                            {count}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Shop Credentials - Two Part Design */}
              {(certificates.length > 0 || factoryVideos.length > 0 || seller.aboutCompany) && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Shop Credentials</h3>
                  
                  {/* Part 1: Documents & Media */}
                  {(certificates.length > 0 || factoryVideos.length > 0) && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-600 mb-2.5">Documents & Media</h4>
                      <div className="space-y-2">
                        {certificates.length > 0 && (
                          <button
                            onClick={() => openSectionPage('certificates', certificates)}
                            className="w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-200 hover:border-blue-400 hover:from-blue-100 hover:to-blue-100/50 transition-all group shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors shadow-sm">
                                <span className="material-symbols-outlined text-white text-lg">description</span>
                              </div>
                              <div className="text-left">
                                <div className="text-sm font-semibold text-gray-800">Certificates</div>
                                <div className="text-xs text-gray-500">{certificates.length} certificate{certificates.length !== 1 ? 's' : ''}</div>
                              </div>
                            </div>
                            <span className="material-symbols-outlined text-blue-600 group-hover:text-blue-700 text-lg">arrow_forward</span>
                          </button>
                        )}

                        {factoryVideos.length > 0 && (
                          <button
                            onClick={() => openSectionPage('factory-video', factoryVideos)}
                            className="w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-purple-50/50 border border-purple-200 hover:border-purple-400 hover:from-purple-100 hover:to-purple-100/50 transition-all group shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-purple-500 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors shadow-sm">
                                <span className="material-symbols-outlined text-white text-lg">videocam</span>
                              </div>
                              <div className="text-left">
                                <div className="text-sm font-semibold text-gray-800">Factory Video</div>
                                <div className="text-xs text-gray-500">{factoryVideos.length} video{factoryVideos.length !== 1 ? 's' : ''}</div>
                              </div>
                            </div>
                            <span className="material-symbols-outlined text-purple-600 group-hover:text-purple-700 text-lg">arrow_forward</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Part 2: Company Information */}
                  {seller.aboutCompany && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-2.5">Company Information</h4>
                      <button
                        onClick={() => openSectionPage('about', { aboutCompany: seller.aboutCompany })}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-green-50/50 border border-green-200 hover:border-green-400 hover:from-green-100 hover:to-green-100/50 transition-all group shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-white text-lg">business</span>
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-semibold text-gray-800">About Company</div>
                            <div className="text-xs text-gray-500">Learn more</div>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-green-600 group-hover:text-green-700 text-lg">arrow_forward</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Info - Only Essential */}
              {(seller.website || seller.gstNumber) && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Quick Info</h3>
                  <div className="space-y-2.5">
                    {seller.website && (
                      <a
                        href={seller.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <span className="material-symbols-outlined text-base">language</span>
                        <span className="truncate">Visit Website</span>
                        <span className="material-symbols-outlined text-sm ml-auto">open_in_new</span>
                      </a>
                    )}
                    {seller.gstNumber && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="material-symbols-outlined text-base text-gray-400">badge</span>
                        <span className="font-mono text-xs">GST: {seller.gstNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Right Side - Products Grid */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {/* Header with Enhanced Search */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCategory === 'all' ? 'All items' : selectedCategory}
                  </h2>
                  <div className="text-sm text-gray-500 whitespace-nowrap">
                    {searchQuery ? (
                      <span>
                        <span className="font-semibold text-gray-700">{filteredProducts.length}</span> result{filteredProducts.length !== 1 ? 's' : ''} for "{searchQuery}"
                      </span>
                    ) : (
                      <span>
                        <span className="font-semibold text-gray-700">{filteredProducts.length}</span> item{filteredProducts.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Enhanced Search Bar - Integrated Design */}
                <div className="relative group">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder={`search all ${products.length} items...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-20 pr-12 py-3.5 bg-white border-2 border-blue-500 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 shadow-sm"
                    />
                    {/* Integrated Search Label/Icon */}
                    <div className="absolute left-4 flex items-center pointer-events-none">
                      <span className="text-blue-600 font-medium text-sm">search</span>
                    </div>
                    {/* Clear Button */}
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 z-10 p-1.5 rounded-lg hover:bg-gray-100 transition-colors group/clear"
                        aria-label="Clear search"
                        title="Clear search"
                      >
                        <span className="material-symbols-outlined text-gray-400 group-hover/clear:text-gray-600 text-lg">
                          close
                        </span>
                      </button>
                    )}
                  </div>
                  
                  {/* Quick Search Section */}
                  {!searchQuery && filteredProducts.length > 0 && categories.length > 1 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-600 font-medium">Quick search:</span>
                      {categories.slice(1, Math.min(5, categories.length)).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setSearchQuery(cat);
                          }}
                          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors font-medium capitalize"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Search Results Indicator */}
                  {searchQuery && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <span className="material-symbols-outlined text-blue-600 text-base">filter_alt</span>
                      <span>
                        Showing results for: <span className="font-semibold text-gray-900">"{searchQuery}"</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl">
                  <p className="text-lg">
                    {searchQuery ? `No products found matching "${searchQuery}"` : 'No products found in this category.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                    // <div
                    //   key={product._id}
                    //   className="bg-white border rounded-xl shadow hover:shadow-lg transition p-4 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                    //   onClick={() => openProductDetails(product._id)}
                    //   onKeyDown={(event) => handleProductKeyDown(event, product._id)}
                    //   role="button"
                    //   tabIndex={0}
                    //   aria-label={`View details for ${product.name}`}
                    //   title="View product in buyer storefront"
                    // >
                    //   <div className="h-48 rounded-lg bg-gray-100 flex items-center justify-center mb-3 overflow-hidden relative">
                    //     {product.images?.[0] ? (
                    //       <img
                    //         src={product.images[0]}
                    //         alt={product.name}
                    //         className="w-full h-full object-cover"
                    //       />
                    //     ) : (
                    //       <span className="text-gray-400">No image</span>
                    //     )}
                    //     {product.priceRange && product.priceRange.min && product.priceRange.max && (
                    //       <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                    //         {Math.round(((product.priceRange.max - product.priceRange.min) / product.priceRange.max) * 100)}% off
                    //       </div>
                    //     )}
                    //   </div>
                    //   <h3 className="font-semibold text-base mb-1 line-clamp-2">{product.name}</h3>
                    //   <p className="text-xs text-gray-500 mb-2 capitalize">{product.category}</p>
                    //   <div className="flex items-center justify-between text-sm">
                    //     <div>
                    //       <span className="font-semibold text-blue-600">₹{product.price?.toLocaleString()}</span>
                    //       {product.priceRange && product.priceRange.min && product.priceRange.max && (
                    //         <span className="text-gray-400 line-through ml-2">₹{product.priceRange.max?.toLocaleString()}</span>
                    //       )}
                    //     </div>
                    //     <span className="text-gray-500">MOQ: {product.moq}</span>
                    //   </div>
                    //   {product.sampleAvailable && (
                    //     <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    //       <span className="material-symbols-outlined text-sm">science</span>
                    //       Sample Available
                    //     </div>
                    //   )}
                    // </div>
                  ))}
                </div>
              )}
            </div>
          </main>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Sellershoppage;
