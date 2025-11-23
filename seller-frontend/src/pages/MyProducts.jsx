import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeller } from '../context/SellerContext';

const MyProducts = () => {
  const navigate = useNavigate();
  const { seller } = useSeller();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      // Use the new API endpoint with proxy

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/products-new/my-products`;

      const response = await fetch(url , {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        console.log('✅ Fetched seller products:', data.products?.length || 0);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch products:', errorData.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (productId) => {
    navigate(`/seller/my-products/${productId}/edit`);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/products-new/delete/${productId}`;

      const response = await fetch(url , {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setProducts(prev => prev.filter(p => p._id !== productId));
        console.log('✅ Product deleted successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading your products...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
        <p className="text-gray-600">View and manage your product catalog</p>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium mb-2">No products added</h3>
          <p className="text-gray-500 mb-4">You haven't added any products yet. Use the "Add Product" option from the sidebar to create your first product.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-4xl">📦</div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 truncate">{product.name}</h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-blue-600">₹{product.price?.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">MOQ: {product.moq || 1}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {product.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {product.manufacturer && (
                  <div className="mb-3">
                    <span className="text-xs text-gray-500">
                      By: {product.manufacturer.companyName}
                      {product.manufacturer.verified && (
                        <span className="ml-1 text-green-600">✓</span>
                      )}
                    </span>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(product._id)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-red-700 transition-colors"
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

export default MyProducts;
