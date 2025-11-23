import React, { useState, useEffect } from 'react';
import { useSeller } from '../context/SellerContext';

const ProductList = ({ isDarkMode = false, onEditProduct }) => {
  const { seller } = useSeller();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [seller]);

  const fetchProducts = async () => {
    if (!seller) return;
    
    try {
      setLoading(true);

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/seller/products?sellerId=${seller._id || seller.id}`;

      const response = await fetch(url , {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setProducts(result.products || []);
      } else {
        setError(result.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Fetch products error:', error);
      setError('Something went wrong while fetching products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/seller/products/${productId}`;

      const response = await fetch(url , {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setProducts(products.filter(product => product._id !== productId));
      } else {
        const result = await response.json();
        setError(result.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Delete product error:', error);
      setError('Something went wrong while deleting product');
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/seller/products/${productId}`;

      const response = await fetch(url , {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const result = await response.json();
        setProducts(products.map(product => 
          product._id === productId ? { ...product, status: newStatus } : product
        ));
      } else {
        const result = await response.json();
        setError(result.message || 'Failed to update product status');
      }
    } catch (error) {
      console.error('Update product status error:', error);
      setError('Something went wrong while updating product');
    }
  };

  const getFilteredProducts = () => {
    let filtered = products;

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(product => product.status === filter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      draft: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-2xl p-6 shadow-sm`}>
        <div className="flex flex-col items-center justify-center h-32">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-2xl p-6 shadow-sm`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">My Products ({products.length})</h2>
        <button
          onClick={fetchProducts}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'
          }`}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {getFilteredProducts().length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-gray-500">
            {products.length === 0 
              ? "Start by creating your first product"
              : "Try adjusting your search or filter criteria"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredProducts().map((product) => (
            <div
              key={product._id}
              className={`border rounded-xl p-4 hover:shadow-lg transition-shadow ${
                isDarkMode ? 'border-white/20 bg-white/5' : 'border-gray-200 bg-gray-50'
              }`}
            >
              {/* Product Image */}
              <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-gray-200">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-gray-500 line-through ml-2">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{product.category}</span>
                  <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => onEditProduct && onEditProduct(product)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-xs hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(product._id, product.status)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs transition-colors ${
                      product.status === 'active' 
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {product.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="bg-red-100 text-red-800 py-2 px-3 rounded-lg text-xs hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
