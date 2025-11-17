import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Sellershoppage = () => {
  const { shopName, sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
                <div key={product._id} className="bg-white border rounded-xl shadow hover:shadow-md transition p-4">
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

