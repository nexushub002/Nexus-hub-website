import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL, getBuyerFrontendUrl } from '../config/api';

/**
 * World-class B2B Seller Shop Page
 * Trust-first, conversion-optimized design for Indian MSMEs
 */
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
  const [activeVideo, setActiveVideo] = useState(null);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  
  // Section refs for smooth scrolling
  const productsRef = useRef(null);
  const aboutRef = useRef(null);
  const certificatesRef = useRef(null);
  const videosRef = useRef(null);

  const apiBaseUrl = API_BASE_URL;
  const buyerAppBaseUrl = useMemo(() => getBuyerFrontendUrl(), []);

  // Fetch seller data
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

        const profileUrl = `${apiBaseUrl}/api/seller-profile/public/${sellerId}`;
        const productsUrl = `${apiBaseUrl}/api/seller-profile/products/${sellerId}?limit=100`;

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
  }, [sellerId, apiBaseUrl]);

  // Banner carousel
  const bannerImages = useMemo(
    () => (seller?.websiteBanners || []).filter((banner) => banner?.url),
    [seller?.websiteBanners]
  );

  useEffect(() => {
    if (bannerImages.length <= 1) return;
    const timer = setInterval(
      () => setCurrentBanner((prev) => (prev + 1) % bannerImages.length),
      5000
    );
    return () => clearInterval(timer);
  }, [bannerImages.length]);

  // Derived data
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [products, selectedCategory, searchQuery]);

  const factoryVideos = useMemo(() => {
    const videos = [];
    if (seller?.factoryVideos && Array.isArray(seller.factoryVideos)) {
      seller.factoryVideos.forEach(video => {
        if (video?.url) {
          videos.push({
            url: video.url,
            title: video.originalName || 'Factory Tour',
            uploadedAt: video.uploadedAt
          });
        }
      });
    }
    return videos;
  }, [seller?.factoryVideos]);

  const certificates = useMemo(() => seller?.certificates || [], [seller?.certificates]);

  // Calculate years in business
  const yearsInBusiness = useMemo(() => {
    if (!seller?.yearOfEstablishment) return null;
    return new Date().getFullYear() - parseInt(seller.yearOfEstablishment);
  }, [seller?.yearOfEstablishment]);

  // Scroll to section
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Open product details
  const openProductDetails = (productId) => {
    window.open(`${buyerAppBaseUrl}/product-detail/${productId}`, '_blank', 'noopener,noreferrer');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="mt-6 text-gray-600 font-medium">Loading manufacturer profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-red-50 px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-red-500 text-4xl">store_mall_directory</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Shop Unavailable</h1>
          <p className="text-gray-600">{error || 'This seller profile could not be found.'}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Extract location
  const location = seller.companyAddress?.split(',').slice(-2).join(',').trim() || seller.companyAddress || 'India';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ============================================ */}
      {/* STICKY NAVIGATION */}
      {/* ============================================ */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              {seller.companyLogo?.url ? (
                <img src={seller.companyLogo.url} alt="" className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{(seller.shopName || seller.companyName || 'S')[0]}</span>
                </div>
              )}
              <span className="font-bold text-gray-800 hidden sm:block">{seller.shopName || seller.companyName}</span>
            </div>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection(productsRef)} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Products
              </button>
              <button onClick={() => scrollToSection(aboutRef)} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                About
              </button>
              {certificates.length > 0 && (
                <button onClick={() => scrollToSection(certificatesRef)} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Certifications
                </button>
              )}
              {factoryVideos.length > 0 && (
                <button onClick={() => scrollToSection(videosRef)} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Factory
                </button>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={() => setShowInquiryForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-blue-600/25"
            >
              Send Inquiry
            </button>
          </div>
        </div>
      </nav>

      {/* ============================================ */}
      {/* SECTION 1: HERO (ABOVE THE FOLD) */}
      {/* ============================================ */}
      <section className="relative">
        {/* Hero Background */}
        <div className="relative h-[420px] sm:h-[480px] lg:h-[520px] overflow-hidden">
          {bannerImages.length > 0 ? (
            <>
              {bannerImages.map((banner, index) => (
                <img
                  key={banner._id || index}
                  src={banner.url}
                  alt=""
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                    index === currentBanner ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900" />
          )}

          {/* Hero Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center">
            <div className="max-w-2xl">
              {/* Verified Badge */}
              {seller.verified && (
                <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <span className="material-symbols-outlined text-lg">verified</span>
                  Verified MSME Manufacturer
                </div>
              )}

              {/* Company Name */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {seller.shopName || seller.companyName}
              </h1>

              {/* Tagline / Industry */}
              <p className="text-xl text-white/80 mb-6">
                {seller.aboutCompany?.slice(0, 100) || `Premium ${categories[1] || 'Products'} Manufacturer`}
                {seller.aboutCompany?.length > 100 && '...'}
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8 text-white/90">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">location_on</span>
                  <span>{location}</span>
                </div>
                {yearsInBusiness && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">schedule</span>
                    <span>{yearsInBusiness}+ Years in Business</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">inventory_2</span>
                  <span>{products.length} Products</span>
                </div>
              </div>

              {/* Hero CTAs */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => scrollToSection(productsRef)}
                  className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">shopping_bag</span>
                  View Products
                </button>
                <button
                  onClick={() => setShowInquiryForm(true)}
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl border-2 border-blue-500 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">mail</span>
                  Send Bulk Inquiry
                </button>
              </div>
            </div>
          </div>

          {/* Banner Indicators */}
          {bannerImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {bannerImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBanner(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentBanner ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 2: TRUST & VERIFICATION BADGES */}
      {/* ============================================ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* MSME Verified */}
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white text-2xl">verified</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">MSME Verified</div>
                <div className="text-xs text-green-600">Business Verified</div>
              </div>
            </div>

            {/* GST Registered */}
            {seller.gstNumber && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-white text-2xl">receipt_long</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">GST Registered</div>
                  <div className="text-xs text-blue-600">Tax Compliant</div>
                </div>
              </div>
            )}

            {/* Certificates Count */}
            {certificates.length > 0 && (
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-white text-2xl">workspace_premium</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{certificates.length} Certificates</div>
                  <div className="text-xs text-purple-600">Quality Certified</div>
                </div>
              </div>
            )}

            {/* Factory Videos */}
            {factoryVideos.length > 0 && (
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-white text-2xl">videocam</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Factory Verified</div>
                  <div className="text-xs text-orange-600">Video Available</div>
                </div>
              </div>
            )}

            {/* Years in Business */}
            {yearsInBusiness && (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-white text-2xl">history</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{yearsInBusiness}+ Years</div>
                  <div className="text-xs text-slate-600">Established</div>
                </div>
              </div>
            )}

            {/* Product Count */}
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white text-2xl">inventory</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">{products.length} Products</div>
                <div className="text-xs text-emerald-600">In Catalog</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 3: ABOUT MSME */}
      {/* ============================================ */}
      <section ref={aboutRef} className="py-16 bg-white" id="about-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Company Info */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="material-symbols-outlined text-lg">business</span>
                About the Manufacturer
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {seller.companyName}
              </h2>

              {seller.aboutCompany && (
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {seller.aboutCompany}
                </p>
              )}

              {/* Key Highlights */}
              <div className="grid sm:grid-cols-2 gap-4">
                {seller.yearOfEstablishment && (
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                    <span className="material-symbols-outlined text-blue-600 text-2xl mt-0.5">calendar_month</span>
                    <div>
                      <div className="font-semibold text-gray-900">Established {seller.yearOfEstablishment}</div>
                      <div className="text-sm text-gray-500">{yearsInBusiness}+ years of experience</div>
                    </div>
                  </div>
                )}
                
                {seller.numberOfEmployees && (
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                    <span className="material-symbols-outlined text-blue-600 text-2xl mt-0.5">groups</span>
                    <div>
                      <div className="font-semibold text-gray-900">{seller.numberOfEmployees} Employees</div>
                      <div className="text-sm text-gray-500">Manufacturing capacity</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <span className="material-symbols-outlined text-blue-600 text-2xl mt-0.5">location_on</span>
                  <div>
                    <div className="font-semibold text-gray-900">Location</div>
                    <div className="text-sm text-gray-500">{location}</div>
                  </div>
                </div>

                {seller.website && (
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                    <span className="material-symbols-outlined text-blue-600 text-2xl mt-0.5">language</span>
                    <div>
                      <div className="font-semibold text-gray-900">Website</div>
                      <a href={seller.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        Visit Website →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Stats & Image */}
            <div className="relative">
              {seller.companyLogo?.url ? (
                <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-blue-50 to-slate-100 rounded-3xl p-8 flex items-center justify-center">
                  <img src={seller.companyLogo.url} alt={seller.companyName} className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl flex items-center justify-center">
                  <span className="text-8xl font-bold text-white/30">{(seller.companyName || 'M')[0]}</span>
                </div>
              )}

              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="text-4xl font-bold text-blue-600">{products.length}+</div>
                <div className="text-gray-600">Products Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4: CERTIFICATES & COMPLIANCE */}
      {/* ============================================ */}
      {certificates.length > 0 && (
        <section ref={certificatesRef} className="py-16 bg-gradient-to-b from-slate-50 to-white" id="certificates-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <span className="material-symbols-outlined text-lg">workspace_premium</span>
                Quality Certifications
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Certified & Compliant
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our certifications demonstrate our commitment to quality standards and compliance.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert, index) => (
                <div key={cert._id || index} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow group">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-white text-2xl">verified</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {cert.originalName || cert.name || `Certificate ${index + 1}`}
                      </h3>
                      {cert.issuingAuthority && (
                        <p className="text-sm text-gray-500 mb-2">{cert.issuingAuthority}</p>
                      )}
                      {cert.year && (
                        <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {cert.year}
                        </span>
                      )}
                    </div>
                  </div>
                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      <span className="material-symbols-outlined text-lg">visibility</span>
                      View Certificate
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================ */}
      {/* SECTION 5: PRODUCT LISTINGS */}
      {/* ============================================ */}
      <section ref={productsRef} className="py-16 bg-white" id="products-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <span className="material-symbols-outlined text-lg">inventory_2</span>
                Product Catalog
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Browse Our Products
              </h2>
              <p className="text-lg text-gray-600">
                {filteredProducts.length} products available for B2B sourcing
              </p>
            </div>

            {/* Search */}
            <div className="w-full lg:w-96">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => {
              const count = cat === 'all' ? products.length : products.filter(p => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All Products' : cat}
                  <span className={`ml-2 ${selectedCategory === cat ? 'text-blue-200' : 'text-gray-400'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-2xl">
              <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => openProductDetails(product._id)}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-slate-100 relative overflow-hidden">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-gray-300">image</span>
                      </div>
                    )}
                    {product.sampleAvailable && (
                      <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                        Sample Available
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 capitalize">{product.category}</p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-blue-600">
                          ₹{product.price?.toLocaleString('en-IN')}
                        </div>
                        {product.priceRange?.min && product.priceRange?.max && (
                          <div className="text-xs text-gray-400">
                            ₹{product.priceRange.min.toLocaleString('en-IN')} - ₹{product.priceRange.max.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">MOQ</div>
                        <div className="font-semibold text-gray-700">{product.moq} pcs</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 6: FACTORY & PROCESS VIDEOS */}
      {/* ============================================ */}
      {factoryVideos.length > 0 && (
        <section ref={videosRef} className="py-16 bg-slate-900" id="videos-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <span className="material-symbols-outlined text-lg">videocam</span>
                Factory Tour
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                See Our Manufacturing Process
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Take a virtual tour of our production facility and see how we maintain quality standards.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {factoryVideos.map((video, index) => (
                <div
                  key={video.url || index}
                  className="relative rounded-2xl overflow-hidden bg-slate-800 group cursor-pointer"
                  onClick={() => setActiveVideo(video.url)}
                >
                  <div className="aspect-video bg-slate-700 flex items-center justify-center">
                    <video
                      src={video.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-slate-900 text-3xl ml-1">play_arrow</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white">{video.title}</h3>
                    <p className="text-sm text-gray-400">Click to play</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================ */}
      {/* SECTION 7: BUYER CTA (CONVERSION) */}
      {/* ============================================ */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Source from {seller.companyName}?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Connect directly with this verified manufacturer for bulk orders, custom requirements, and competitive pricing.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-10 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-300">verified</span>
              <span>Verified MSME</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-300">security</span>
              <span>Secure Communication</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-300">support_agent</span>
              <span>Direct Factory Contact</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowInquiryForm(true)}
              className="bg-white text-blue-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">mail</span>
              Send Bulk Inquiry
            </button>
            <button
              onClick={() => scrollToSection(productsRef)}
              className="bg-transparent text-white px-10 py-4 rounded-xl font-bold text-lg border-2 border-white/50 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              Browse Products
            </button>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="bg-slate-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              {seller.companyLogo?.url ? (
                <img src={seller.companyLogo.url} alt="" className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">{(seller.companyName || 'M')[0]}</span>
                </div>
              )}
              <div>
                <div className="font-semibold text-white">{seller.companyName}</div>
                <div className="text-sm">{location}</div>
              </div>
            </div>
            
            <div className="text-sm text-center md:text-right">
              <p>This is an official business page on NexusHub</p>
              <p className="text-gray-500">© {new Date().getFullYear()} All rights reserved</p>
            </div>
          </div>
        </div>
      </footer>

      {/* ============================================ */}
      {/* INQUIRY MODAL */}
      {/* ============================================ */}
      {showInquiryForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Send Inquiry</h3>
                <button
                  onClick={() => setShowInquiryForm(false)}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <p className="text-gray-500 mt-1">Contact {seller.companyName} directly</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input type="email" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input type="tel" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your phone number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" placeholder="Describe your requirements, quantity needed, etc." />
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold transition-colors">
                Send Inquiry
              </button>
              <p className="text-xs text-center text-gray-500">
                By sending this inquiry, you agree to be contacted by the manufacturer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* VIDEO MODAL */}
      {/* ============================================ */}
      {activeVideo && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <button className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors">
            <span className="material-symbols-outlined text-4xl">close</span>
          </button>
          <video
            src={activeVideo}
            controls
            autoPlay
            className="max-w-full max-h-[90vh] rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Sellershoppage;
