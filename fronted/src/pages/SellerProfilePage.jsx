import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './SellerProfilePage.css';
import { buildApiUrl } from '../config/api';

const SellerProfilePage = () => {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [productsPage, setProductsPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    if (sellerId) {
      fetchSellerProfile();
      fetchSellerProducts();
    }
  }, [sellerId, productsPage]);

  const fetchSellerProfile = async () => {
    try {
      setLoading(true);

      const url = buildApiUrl(`/api/seller-profile/public/${sellerId}`);

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setSeller(data.seller);
      } else {
        setError('Seller not found');
      }
    } catch (err) {
      console.error('Error fetching seller profile:', err);
      setError('Failed to load seller profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerProducts = async () => {
    try {

      const url = buildApiUrl(`/api/seller-profile/products/${sellerId}?page=${productsPage}&limit=12`);

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
        setTotalProducts(data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching seller products:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading seller profile...</p>
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div>
        <Navbar />
        <div className="error-container">
          <span className="material-symbols-outlined error-icon">error</span>
          <h3>Seller not found</h3>
          <p>{error || 'The seller you are looking for does not exist.'}</p>
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="seller-profile-container">
        {/* Seller Header */}
        <div className="seller-header-section">
          <div className="seller-header-content">
            <div className="seller-avatar">
              {seller.companyLogo?.url ? (
                <img src={seller.companyLogo.url} alt={seller.companyName} />
              ) : (
                <div className="avatar-placeholder">
                  {seller.companyName?.charAt(0) || 'S'}
                </div>
              )}
            </div>
            
            <div className="seller-info">
              <h1>{seller.companyName}</h1>
              <div className="seller-meta">
                <span className="seller-id">ID: {seller.sellerId}</span>
                {seller.verified && (
                  <span className="verified-badge">
                    <span className="material-symbols-outlined">verified</span>
                    Verified Seller
                  </span>
                )}
              </div>
              
              <div className="seller-stats">
                <div className="stat">
                  <span className="stat-number">{totalProducts}</span>
                  <span className="stat-label">Products</span>
                </div>
                {seller.yearOfEstablishment && (
                  <div className="stat">
                    <span className="stat-number">{seller.yearOfEstablishment}</span>
                    <span className="stat-label">Established</span>
                  </div>
                )}
                {seller.numberOfEmployees && (
                  <div className="stat">
                    <span className="stat-number">{seller.numberOfEmployees}+</span>
                    <span className="stat-label">Employees</span>
                  </div>
                )}
                <div className="stat">
                  <span className="stat-number">{formatDate(seller.createdAt)}</span>
                  <span className="stat-label">Member Since</span>
                </div>
              </div>
              
              {/* Quick Contact Info */}
              <div className="quick-contact">
                <div className="contact-item-inline">
                  <span className="material-symbols-outlined">phone</span>
                  <span>{seller.contactPerson?.phone || seller.phone}</span>
                </div>
                <div className="contact-item-inline">
                  <span className="material-symbols-outlined">email</span>
                  <span>{seller.contactPerson?.email || seller.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="seller-tabs">
          <button 
            className={`tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About Company
          </button>
          <button 
            className={`tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products ({totalProducts})
          </button>
          <button 
            className={`tab ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact Info
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'about' && (
            <div className="about-section">
              <div className="about-grid">
                <div className="about-card">
                  <h3>Company Overview</h3>
                  <p>{seller.aboutCompany || 'No company description available.'}</p>
                  
                  {seller.website && (
                    <div className="website-link">
                      <span className="material-symbols-outlined">language</span>
                      <a href={seller.website} target="_blank" rel="noopener noreferrer">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>

                <div className="about-card">
                  <h3>Company Details</h3>
                  <div className="detail-list">
                    <div className="detail-item">
                      <strong>Company Address:</strong>
                      <span>{seller.companyAddress}</span>
                    </div>
                    {seller.factoryAddress && (
                      <div className="detail-item">
                        <strong>Factory Address:</strong>
                        <span>{seller.factoryAddress}</span>
                      </div>
                    )}
                    {seller.gstNumber && (
                      <div className="detail-item">
                        <strong>GST Number:</strong>
                        <span>{seller.gstNumber}</span>
                      </div>
                    )}
                    {seller.yearsInBusiness && (
                      <div className="detail-item">
                        <strong>Years in Business:</strong>
                        <span>{seller.yearsInBusiness} years</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="products-section">
              {products.length > 0 ? (
                <>
                  <div className="products-grid">
                    {products.map((product) => (
                      <Link 
                        key={product._id} 
                        to={`/product/${product._id}`}
                        className="product-card"
                      >
                        <div className="product-image">
                          <img 
                            src={product.images?.[0] || '/placeholder-image.jpg'} 
                            alt={product.name}
                          />
                        </div>
                        <div className="product-info">
                          <h4>{product.name}</h4>
                          <p className="product-category">{product.category} › {product.subcategory}</p>
                          <div className="product-price">
                            <span className="price">{formatPrice(product.price)}</span>
                            <span className="moq">MOQ: {product.moq}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {Math.ceil(totalProducts / 12) > 1 && (
                    <div className="pagination">
                      <button 
                        onClick={() => setProductsPage(prev => Math.max(1, prev - 1))}
                        disabled={productsPage === 1}
                        className="pagination-btn"
                      >
                        Previous
                      </button>
                      <span className="pagination-info">
                        Page {productsPage} of {Math.ceil(totalProducts / 12)}
                      </span>
                      <button 
                        onClick={() => setProductsPage(prev => prev + 1)}
                        disabled={productsPage >= Math.ceil(totalProducts / 12)}
                        className="pagination-btn"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-products">
                  <span className="material-symbols-outlined">inventory_2</span>
                  <h3>No Products Available</h3>
                  <p>This seller hasn't added any products yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="contact-section">
              <div className="contact-grid">
                <div className="contact-card">
                  <h3>Contact Person</h3>
                  <div className="contact-info">
                    <div className="contact-item">
                      <span className="material-symbols-outlined">person</span>
                      <div>
                        <strong>{seller.contactPerson?.name}</strong>
                        {seller.contactPerson?.designation && (
                          <p>{seller.contactPerson.designation}</p>
                        )}
                      </div>
                    </div>
                    <div className="contact-item">
                      <span className="material-symbols-outlined">phone</span>
                      <div>
                        <strong>Phone</strong>
                        <p>{seller.contactPerson?.phone || seller.phone}</p>
                      </div>
                    </div>
                    <div className="contact-item">
                      <span className="material-symbols-outlined">email</span>
                      <div>
                        <strong>Email</strong>
                        <p>{seller.contactPerson?.email || seller.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="contact-card">
                  <h3>Business Information</h3>
                  <div className="business-info">
                    <div className="info-item">
                      <span className="material-symbols-outlined">business</span>
                      <div>
                        <strong>Company Address</strong>
                        <p>{seller.companyAddress}</p>
                      </div>
                    </div>
                    {seller.factoryAddress && (
                      <div className="info-item">
                        <span className="material-symbols-outlined">factory</span>
                        <div>
                          <strong>Factory Address</strong>
                          <p>{seller.factoryAddress}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfilePage;
