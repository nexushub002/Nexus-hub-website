import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/product/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setProduct(data);
      } else {
        setError(data.message || 'Product not found');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError('Error loading product details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading product details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Product not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}
          </div>
          
          {/* Additional Images */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((image, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-xl text-blue-600 font-semibold mt-2">
              ₹{product.price?.toLocaleString()}
            </p>
            {product.priceRange && (
              <p className="text-sm text-gray-600">
                Price Range: ₹{product.priceRange.min?.toLocaleString()} - ₹{product.priceRange.max?.toLocaleString()}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Category:</span>
              <p className="text-gray-600">{product.category}</p>
            </div>
            <div>
              <span className="font-medium">Subcategory:</span>
              <p className="text-gray-600">{product.subcategory}</p>
            </div>
            <div>
              <span className="font-medium">MOQ:</span>
              <p className="text-gray-600">{product.moq} units</p>
            </div>
            <div>
              <span className="font-medium">Sample Available:</span>
              <p className="text-gray-600">{product.sampleAvailable ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {product.sampleAvailable && product.samplePrice && (
            <div>
              <span className="font-medium">Sample Price:</span>
              <p className="text-gray-600">₹{product.samplePrice}</p>
            </div>
          )}

          <div className="flex space-x-4">
            <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition">
              Contact Seller
            </button>
            <button className="flex-1 border border-blue-600 text-blue-600 py-3 px-6 rounded-lg hover:bg-blue-50 transition">
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>

      {/* Manufacturer Information Section */}
      {product.manufacturerInfo && (
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">About the Manufacturer</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Company Overview */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {product.manufacturerInfo.companyLogo?.url && (
                  <img 
                    src={product.manufacturerInfo.companyLogo.url} 
                    alt="Company Logo"
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                )}
                <div>
                  <h3 className="text-xl font-semibold">{product.manufacturerInfo.companyName}</h3>
                  {product.manufacturerInfo.verified && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Verified Manufacturer
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="font-medium">Company Address:</span>
                  <p className="text-gray-700">{product.manufacturerInfo.companyAddress}</p>
                </div>
                
                {product.manufacturerInfo.yearOfEstablishment && (
                  <div>
                    <span className="font-medium">Established:</span>
                    <p className="text-gray-700">{product.manufacturerInfo.yearOfEstablishment}</p>
                  </div>
                )}

                {product.manufacturerInfo.aboutCompany && (
                  <div>
                    <span className="font-medium">About:</span>
                    <p className="text-gray-700">{product.manufacturerInfo.aboutCompany}</p>
                  </div>
                )}

                {product.manufacturerInfo.website && (
                  <div>
                    <span className="font-medium">Website:</span>
                    <a 
                      href={product.manufacturerInfo.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {product.manufacturerInfo.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information & Stats */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Contact Information</h4>
              
              {product.manufacturerInfo.contactPerson && (
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Contact Person:</span>
                    <p className="text-gray-700">
                      {product.manufacturerInfo.contactPerson.name}
                      {product.manufacturerInfo.contactPerson.designation && 
                        ` (${product.manufacturerInfo.contactPerson.designation})`
                      }
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-medium">Phone:</span>
                    <p className="text-gray-700">{product.manufacturerInfo.contactPerson.phone}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium">Email:</span>
                    <p className="text-gray-700">{product.manufacturerInfo.contactPerson.email}</p>
                  </div>
                </div>
              )}

              {/* Business Stats */}
              <div className="bg-white rounded-lg p-4 space-y-2">
                <h5 className="font-semibold">Business Statistics</h5>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Products:</span>
                    <p className="font-medium">{product.manufacturerInfo.totalProducts || 0}</p>
                  </div>
                  
                  {product.manufacturerInfo.sellerSince && (
                    <div>
                      <span className="text-gray-600">Seller Since:</span>
                      <p className="font-medium">
                        {new Date(product.manufacturerInfo.sellerSince).getFullYear()}
                      </p>
                    </div>
                  )}
                  
                  {product.manufacturerInfo.yearsInBusiness && (
                    <div>
                      <span className="text-gray-600">Years in Business:</span>
                      <p className="font-medium">{product.manufacturerInfo.yearsInBusiness}</p>
                    </div>
                  )}

                  {product.manufacturerInfo.numberOfEmployees && (
                    <div>
                      <span className="text-gray-600">Employees:</span>
                      <p className="font-medium">{product.manufacturerInfo.numberOfEmployees}+</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Legal Information */}
              {(product.manufacturerInfo.gstin || product.manufacturerInfo.cin || product.manufacturerInfo.pan) && (
                <div className="bg-white rounded-lg p-4 space-y-2">
                  <h5 className="font-semibold">Legal Information</h5>
                  <div className="space-y-1 text-sm">
                    {product.manufacturerInfo.gstin && (
                      <div>
                        <span className="text-gray-600">GSTIN:</span>
                        <span className="ml-2 font-mono">{product.manufacturerInfo.gstin}</span>
                      </div>
                    )}
                    {product.manufacturerInfo.cin && (
                      <div>
                        <span className="text-gray-600">CIN:</span>
                        <span className="ml-2 font-mono">{product.manufacturerInfo.cin}</span>
                      </div>
                    )}
                    {product.manufacturerInfo.pan && (
                      <div>
                        <span className="text-gray-600">PAN:</span>
                        <span className="ml-2 font-mono">{product.manufacturerInfo.pan}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-4">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Contact Manufacturer
            </button>
            <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition">
              View All Products by {product.manufacturerInfo.companyName}
            </button>
          </div>
        </div>
      )}

      {/* Additional Product Details */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {product.warranty && (
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Warranty</h4>
            <p className="text-gray-700">{product.warranty}</p>
          </div>
        )}

        {product.returnPolicy && (
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Return Policy</h4>
            <p className="text-gray-700">{product.returnPolicy}</p>
          </div>
        )}

        {product.customization && (
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Customization</h4>
            <p className="text-gray-700">
              {product.customization.available ? 'Available' : 'Not Available'}
            </p>
            {product.customization.details && (
              <p className="text-sm text-gray-600 mt-1">{product.customization.details}</p>
            )}
          </div>
        )}

        {product.hsCode && (
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold mb-2">HS Code</h4>
            <p className="text-gray-700 font-mono">{product.hsCode}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
