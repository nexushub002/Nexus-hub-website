import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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

  // Get factory videos from documents
  const factoryVideos = useMemo(() => {
    if (!seller?.documents) return [];
    return seller.documents.filter(doc => 
      doc.resourceType === 'video' || 
      doc.format === 'mp4' || 
      doc.format === 'mov' ||
      doc.originalName?.toLowerCase().includes('factory') ||
      doc.originalName?.toLowerCase().includes('video')
    );
  }, [seller?.documents]);

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
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading shop...</p>
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
      {/* Banner Section */}
      {bannerImages.length > 0 && (
        <section className="mb-8">
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
          {/* Left Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6 sticky top-4">
              {/* Categories/Filter Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Categories</h3>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="capitalize">{cat === 'all' ? 'All items' : cat}</span>
                      <span className="text-gray-400 ml-2">
                        ({cat === 'all' ? products.length : products.filter(p => p.category === cat).length})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Shop Owner */}
              <div>
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  onClick={() => {
                    window.open(`${buyerAppBaseUrl}/product-detail?contact=${sellerId}`, '_blank');
                  }}
                >
                  <span className="material-symbols-outlined">chat_bubble</span>
                  Contact shop owner
                </button>
              </div>

              {/* Shop Performance Metrics */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Shop Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Products</span>
                    <span className="font-semibold text-gray-800">{products.length}</span>
                  </div>
                  {seller.verified && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-green-600 text-lg">verified</span>
                      <span className="text-gray-600">Verified Seller</span>
                    </div>
                  )}
                  {seller.yearOfEstablishment && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Established</span>
                      <span className="font-semibold text-gray-800">{seller.yearOfEstablishment}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Certificates Section */}
              {certificates.length > 0 && (
                <div className="border-t pt-4">
                  <button
                    onClick={() => openSectionPage('certificates', certificates)}
                    className="w-full text-left text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide cursor-pointer flex items-center justify-between hover:text-blue-600 transition-colors"
                  >
                    <span>Certificates</span>
                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                  </button>
                  <p className="text-xs text-gray-500 mb-2">{certificates.length} certificate(s) available</p>
                </div>
              )}

              {/* Factory Video Section */}
              {factoryVideos.length > 0 && (
                <div className="border-t pt-4">
                  <button
                    onClick={() => openSectionPage('factory-video', factoryVideos)}
                    className="w-full text-left text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide cursor-pointer flex items-center justify-between hover:text-blue-600 transition-colors"
                  >
                    <span>Factory Video</span>
                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                  </button>
                  <p className="text-xs text-gray-500 mb-2">{factoryVideos.length} video(s) available</p>
                </div>
              )}

              {/* About Company Section */}
              {seller.aboutCompany && (
                <div className="border-t pt-4">
                  <button
                    onClick={() => openSectionPage('about', { aboutCompany: seller.aboutCompany })}
                    className="w-full text-left text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide cursor-pointer flex items-center justify-between hover:text-blue-600 transition-colors"
                  >
                    <span>About Company</span>
                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                  </button>
                  <p className="text-xs text-gray-500 line-clamp-2">{seller.aboutCompany.substring(0, 100)}...</p>
                </div>
              )}

              {/* Additional Information */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Information</h3>
                <div className="space-y-2 text-sm">
                  {seller.companyAddress && (
                    <div>
                      <span className="text-gray-500">Address:</span>
                      <p className="text-gray-700">{seller.companyAddress}</p>
                    </div>
                  )}
                  {seller.factoryAddress && (
                    <div>
                      <span className="text-gray-500">Factory:</span>
                      <p className="text-gray-700">{seller.factoryAddress}</p>
                    </div>
                  )}
                  {seller.gstNumber && (
                    <div>
                      <span className="text-gray-500">GST:</span>
                      <p className="text-gray-700 font-mono">{seller.gstNumber}</p>
                    </div>
                  )}
                  {seller.website && (
                    <div>
                      <a
                        href={seller.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>Website</span>
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Report Shop */}
              <div className="border-t pt-4">
                <button className="text-xs text-gray-500 hover:text-gray-700 underline">
                  Report this shop
                </button>
              </div>
            </div>
          </aside>

          {/* Right Side - Products Grid */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {/* Header with Search */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-xl font-semibold">
                  {selectedCategory === 'all' ? 'All items' : selectedCategory}
                </h2>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 sm:flex-initial sm:w-64">
                    <input
                      type="text"
                      placeholder={`Search all ${products.length} items`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      search
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {filteredProducts.length} items
                  </span>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl">
                  <p className="text-lg">
                    {searchQuery ? `No products found matching "${searchQuery}"` : 'No products found in this category.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white border rounded-xl shadow hover:shadow-lg transition p-4 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                      onClick={() => openProductDetails(product._id)}
                      onKeyDown={(event) => handleProductKeyDown(event, product._id)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View details for ${product.name}`}
                      title="View product in buyer storefront"
                    >
                      <div className="h-48 rounded-lg bg-gray-100 flex items-center justify-center mb-3 overflow-hidden relative">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-400">No image</span>
                        )}
                        {product.priceRange && product.priceRange.min && product.priceRange.max && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                            {Math.round(((product.priceRange.max - product.priceRange.min) / product.priceRange.max) * 100)}% off
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-base mb-1 line-clamp-2">{product.name}</h3>
                      <p className="text-xs text-gray-500 mb-2 capitalize">{product.category}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-semibold text-blue-600">₹{product.price?.toLocaleString()}</span>
                          {product.priceRange && product.priceRange.min && product.priceRange.max && (
                            <span className="text-gray-400 line-through ml-2">₹{product.priceRange.max?.toLocaleString()}</span>
                          )}
                        </div>
                        <span className="text-gray-500">MOQ: {product.moq}</span>
                      </div>
                      {product.sampleAvailable && (
                        <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">science</span>
                          Sample Available
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Sellershoppage;
