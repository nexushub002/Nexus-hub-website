import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const SellersManagement = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSeller, setExpandedSeller] = useState(null);
  const [sellerProducts, setSellerProducts] = useState({});
  const [loadingProducts, setLoadingProducts] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editingSellerId, setEditingSellerId] = useState(null);
  const [editSellerIdValue, setEditSellerIdValue] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState({ product: null, seller: null });

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      const filtered = sellers.filter(seller => {
        const email = (seller.email || '').toLowerCase();
        const mobile = (seller.mobile || seller.phone || '').toString().toLowerCase();
        const sellerId = (seller.sellerId || '').toLowerCase();
        return email.includes(query) || mobile.includes(query) || sellerId.includes(query);
      });
      setFilteredSellers(filtered);
    } else {
      setFilteredSellers(sellers);
    }
  }, [searchQuery, sellers]);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/sellers`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSellers(data.sellers || []);
          setFilteredSellers(data.sellers || []);
        } else {
          setError(data.message || 'Failed to fetch sellers');
        }
      } else {
        setError('Failed to fetch sellers');
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerProducts = async (sellerId) => {
    if (sellerProducts[sellerId]) return; // Already loaded

    setLoadingProducts(prev => ({ ...prev, [sellerId]: true }));
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/sellers/${sellerId}/products`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSellerProducts(prev => ({ ...prev, [sellerId]: data.products || [] }));
        }
      }
    } catch (error) {
      console.error('Error fetching seller products:', error);
    } finally {
      setLoadingProducts(prev => ({ ...prev, [sellerId]: false }));
    }
  };

  const handleExpandSeller = (sellerId) => {
    if (expandedSeller === sellerId) {
      setExpandedSeller(null);
    } else {
      setExpandedSeller(sellerId);
      fetchSellerProducts(sellerId);
    }
  };

  const handleEditSellerId = (seller) => {
    setEditingSellerId(seller._id);
    setEditSellerIdValue(seller.sellerId || '');
  };

  const handleSaveSellerId = async (sellerId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/sellers/${sellerId}/update-id`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ newSellerId: editSellerIdValue }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSellers(prev =>
            prev.map(s => (s._id === sellerId ? data.seller : s))
          );
          setEditingSellerId(null);
          alert('Seller ID updated successfully!');
        } else {
          alert(data.message || 'Error updating seller ID');
        }
      }
    } catch (error) {
      console.error('Error updating seller ID:', error);
      alert('Error updating seller ID');
    }
  };

  const handleDeleteSeller = async (sellerId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/sellers/${sellerId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSellers(prev => prev.filter(s => s.sellerId !== sellerId));
          setFilteredSellers(prev => prev.filter(s => s.sellerId !== sellerId));
          setShowDeleteConfirm({ product: null, seller: null });
          alert('Seller account deleted successfully!');
        }
      }
    } catch (error) {
      console.error('Error deleting seller:', error);
      alert('Error deleting seller');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product._id);
    setEditFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || '',
    });
  };

  const handleSaveProduct = async (productId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/products/${productId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(editFormData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Refresh seller products
          const sellerId = Object.keys(sellerProducts).find(
            key => sellerProducts[key].some(p => p._id === productId)
          );
          if (sellerId) {
            setSellerProducts(prev => ({
              ...prev,
              [sellerId]: prev[sellerId].map(p =>
                p._id === productId ? data.product : p
              ),
            }));
          }
          setEditingProduct(null);
          alert('Product updated successfully!');
        }
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    }
  };

  const handleDeleteProduct = async (productId, sellerId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/products/${productId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSellerProducts(prev => ({
            ...prev,
            [sellerId]: prev[sellerId].filter(p => p._id !== productId),
          }));
          setShowDeleteConfirm({ product: null, seller: null });
          alert('Product deleted successfully!');
        }
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const handleSuspendSeller = async (sellerId, suspend) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/sellers/${sellerId}/suspend`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ suspended: suspend }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSellers(prev =>
            prev.map(s => (s.sellerId === sellerId ? data.seller : s))
          );
          setFilteredSellers(prev =>
            prev.map(s => (s.sellerId === sellerId ? data.seller : s))
          );
          alert(suspend ? 'Seller suspended successfully!' : 'Seller activated successfully!');
        }
      }
    } catch (error) {
      console.error('Error suspending seller:', error);
      alert('Error suspending seller');
    }
  };

  const displaySellers = searchQuery.trim() ? filteredSellers : sellers;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-x-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Sellers Management
                </h1>
                <p className="text-gray-600 mt-1.5">Manage sellers, view products, and control access</p>
              </div>
              <button
                onClick={fetchSellers}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">refresh</span>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400">search</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email, mobile, or seller ID..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-600">
                Found {filteredSellers.length} seller{filteredSellers.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading sellers...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : (
            <div className="space-y-4">
              {displaySellers.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">store</span>
                  <p className="text-gray-500 font-medium">No sellers found</p>
                  {searchQuery && (
                    <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                  )}
                </div>
              ) : (
                displaySellers.map((seller) => (
                  <div
                    key={seller._id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Seller Header */}
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                            {seller.companyName?.[0]?.toUpperCase() || seller.name?.[0]?.toUpperCase() || 'S'}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg mb-1">
                              {seller.companyName || seller.name || 'Unknown Seller'}
                            </h3>
                            <div className="flex items-center gap-4 text-sm">
                              {editingSellerId === seller._id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={editSellerIdValue}
                                    onChange={(e) => setEditSellerIdValue(e.target.value)}
                                    className="px-3 py-1 border border-purple-300 rounded-lg text-sm font-mono bg-white"
                                    placeholder="Seller ID"
                                  />
                                  <button
                                    onClick={() => handleSaveSellerId(seller._id)}
                                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingSellerId(null)}
                                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-600 font-medium">ID:</span>
                                    <span className="font-mono text-purple-700 bg-purple-50 px-2 py-1 rounded font-semibold">
                                      {seller.sellerId || 'N/A'}
                                    </span>
                                    <button
                                      onClick={() => handleEditSellerId(seller)}
                                      className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded transition-colors"
                                      title="Edit Seller ID"
                                    >
                                      <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                  </div>
                                  <span>•</span>
                                  <span className="text-gray-600">{seller.email}</span>
                                  <span>•</span>
                                  <span className="text-gray-600">{seller.mobile || seller.phone || 'N/A'}</span>
                                  {seller.suspended && (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                                      Suspended
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/sellers/${seller.sellerId}/profile`)}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-lg align-middle">visibility</span>
                            View
                          </button>
                          <button
                            onClick={() => handleSuspendSeller(seller.sellerId, !seller.suspended)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              seller.suspended
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            }`}
                          >
                            <span className="material-symbols-outlined text-lg align-middle mr-1">
                              {seller.suspended ? 'check_circle' : 'block'}
                            </span>
                            {seller.suspended ? 'Activate' : 'Suspend'}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm({ product: null, seller: seller.sellerId })}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                          >
                            <span className="material-symbols-outlined text-lg align-middle mr-1">delete</span>
                            Delete
                          </button>
                          <button
                            onClick={() => handleExpandSeller(seller.sellerId)}
                            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                          >
                            <span className="material-symbols-outlined text-lg align-middle">
                              {expandedSeller === seller.sellerId ? 'expand_less' : 'expand_more'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Seller Products */}
                    {expandedSeller === seller.sellerId && (
                      <div className="p-5 bg-gray-50 border-t border-gray-200">
                        {loadingProducts[seller.sellerId] ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                            <span className="ml-3 text-gray-600">Loading products...</span>
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <span className="material-symbols-outlined text-purple-600">inventory_2</span>
                              Products ({sellerProducts[seller.sellerId]?.length || 0})
                            </h4>
                            {sellerProducts[seller.sellerId]?.length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inventory</span>
                                <p>No products found for this seller</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sellerProducts[seller.sellerId]?.map((product) => (
                                  <div
                                    key={product._id}
                                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                                  >
                                    {editingProduct === product._id ? (
                                      <div className="space-y-3">
                                        <input
                                          type="text"
                                          value={editFormData.name}
                                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                          placeholder="Product Name"
                                        />
                                        <input
                                          type="number"
                                          value={editFormData.price}
                                          onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                          placeholder="Price"
                                        />
                                        <textarea
                                          value={editFormData.description}
                                          onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                          placeholder="Description"
                                          rows="2"
                                        />
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => handleSaveProduct(product._id)}
                                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                          >
                                            Save
                                          </button>
                                          <button
                                            onClick={() => setEditingProduct(null)}
                                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="flex items-start justify-between mb-2">
                                          <h5 className="font-semibold text-gray-900 text-sm flex-1">{product.name}</h5>
                                          <span className="text-xs text-gray-500 font-medium">₹{product.price}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                          {product.description || 'No description'}
                                        </p>
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => handleEditProduct(product)}
                                            className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-xs font-medium transition-colors flex items-center justify-center gap-1"
                                          >
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                            Edit
                                          </button>
                                          <button
                                            onClick={() => setShowDeleteConfirm({ product: product._id, seller: seller.sellerId })}
                                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-xs font-medium transition-colors"
                                          >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm.product && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Product</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteProduct(showDeleteConfirm.product, showDeleteConfirm.seller)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm({ product: null, seller: null })}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm.seller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Seller Account</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this seller account? This will permanently delete:
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Seller account</li>
                <li>All seller's products</li>
                <li>All associated data</li>
              </ul>
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteSeller(showDeleteConfirm.seller)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete Account
              </button>
              <button
                onClick={() => setShowDeleteConfirm({ product: null, seller: null })}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellersManagement;
