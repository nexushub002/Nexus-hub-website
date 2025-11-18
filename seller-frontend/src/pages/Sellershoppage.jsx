import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

const Sellershoppage = () => {
  const { shopName, sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentBanner, setCurrentBanner] = useState(0);

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
    <div className="min-h-screen bg-gray-50 text-gray-800 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <section className="mb-8 -mx-4 sm:mx-0">
          {bannerImages.length > 0 ? (
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
          ) : (
            <div className="rounded-3xl bg-gradient-to-r from-blue-50 via-white to-purple-50 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold mb-2">Showcase in progress</h2>
              <p className="text-gray-600">
                This seller has not uploaded website banners yet. Check back soon to explore their highlights.
              </p>
            </div>
          )}
        </section>

        <header className="bg-white rounded-2xl shadow-sm p-6 mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase text-gray-400 tracking-wide">Shop</p>
            <h1 className="text-3xl font-semibold capitalize">
              {seller.shopName || shopName || seller.companyName || 'Seller Shop'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Seller ID: {seller.sellerId}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">{seller.companyName}</p>
            {seller.companyAddress && <p className="text-sm text-gray-500">{seller.companyAddress}</p>}
          </div>
        </header>

        <section className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Products</h2>
            <span className="text-sm text-gray-500">{products.length} items</span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl">
              <p className="text-lg">No products have been published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
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
                  <div className="h-40 rounded-lg bg-gray-100 flex items-center justify-center mb-3 overflow-hidden">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">No image</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-blue-600">₹{product.price}</span>
                    <span className="text-gray-500">MOQ: {product.moq}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Sellershoppage;

