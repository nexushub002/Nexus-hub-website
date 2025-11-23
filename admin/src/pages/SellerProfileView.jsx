import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const SellerProfileView = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    certificates: true,
    documents: true,
    factoryVideos: true,
    products: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [shopNameError, setShopNameError] = useState('');
  const [checkingShopName, setCheckingShopName] = useState(false);
  const [shopNameValid, setShopNameValid] = useState(true);
  const shopNameCheckTimeoutRef = useRef(null);

  useEffect(() => {
    if (sellerId) {
      console.log('Fetching profile for sellerId:', sellerId);
      fetchSellerProfile();
      fetchSellerProducts();
    } else {
      setError('Seller ID is missing');
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    if (seller) {
      // Initialize form data when seller is loaded or when entering edit mode
      setEditFormData({
        name: seller.name || '',
        email: seller.email || '',
        phone: seller.phone || seller.mobile || '',
        companyName: seller.companyName || '',
        shopName: seller.shopName || '',
        yearOfEstablishment: seller.yearOfEstablishment || '',
        numberOfEmployees: seller.numberOfEmployees || '',
        companyAddress: seller.companyAddress || '',
        factoryAddress: seller.factoryAddress || '',
        website: seller.website || '',
        aboutCompany: seller.aboutCompany || '',
        gstNumber: seller.gstNumber || '',
        pan: seller.pan || '',
        cin: seller.cin || '',
        contactPerson: seller.contactPerson ? {
          name: seller.contactPerson.name || '',
          designation: seller.contactPerson.designation || '',
          phone: seller.contactPerson.phone || '',
          email: seller.contactPerson.email || '',
        } : {
          name: '',
          designation: '',
          phone: '',
          email: '',
        },
      });
    }
  }, [seller]);

  const fetchSellerProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/sellers/${sellerId}/profile`,
        {
          credentials: 'include',
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success) {
        setSeller(data.seller);
      } else {
        setError(data.message || `Failed to fetch seller profile (Status: ${response.status})`);
        console.error('Error response:', data);
      }
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      setError(`Network error: ${error.message}. Please check if the backend server is running.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerProducts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/sellers/${sellerId}/products`,
        {
          credentials: 'include',
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success) {
        setProducts(data.products || []);
      } else {
        console.error('Error fetching products:', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching seller products:', error);
    }
  };

  const checkShopNameAvailability = async (shopName) => {
    if (!shopName || shopName.trim() === '') {
      setShopNameError('');
      setShopNameValid(true);
      return;
    }

    // If shop name hasn't changed, it's valid
    if (shopName.trim().toLowerCase() === (seller?.shopName || '').toLowerCase()) {
      setShopNameError('');
      setShopNameValid(true);
      return;
    }

    setCheckingShopName(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/check-shop-name?shopName=${encodeURIComponent(shopName.trim())}&excludeSellerId=${sellerId}`,
        {
          credentials: 'include',
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success) {
        if (data.available) {
          setShopNameError('');
          setShopNameValid(true);
        } else {
          setShopNameError('This shop name is already taken by another seller');
          setShopNameValid(false);
        }
      } else {
        setShopNameError('Unable to verify shop name availability');
        setShopNameValid(false);
      }
    } catch (error) {
      console.error('Error checking shop name:', error);
      setShopNameError('Error checking shop name availability');
      setShopNameValid(false);
    } finally {
      setCheckingShopName(false);
    }
  };

  const handleShopNameChange = (value) => {
    setEditFormData({ ...editFormData, shopName: value });
    setShopNameError('');
    setShopNameValid(true);
    
    // Clear previous timeout
    if (shopNameCheckTimeoutRef.current) {
      clearTimeout(shopNameCheckTimeoutRef.current);
    }
    
    // Debounce the check - wait 500ms after user stops typing
    shopNameCheckTimeoutRef.current = setTimeout(() => {
      checkShopNameAvailability(value);
    }, 500);
  };

  const handleSaveProfile = async () => {
    // Validate shop name before saving
    if (editFormData.shopName && editFormData.shopName.trim() !== '') {
      if (!shopNameValid) {
        alert('Please fix the shop name error before saving');
        return;
      }
      // Do a final check before saving
      await checkShopNameAvailability(editFormData.shopName);
      if (!shopNameValid) {
        alert('Shop name is already taken. Please choose a different name.');
        return;
      }
    }

    try {
      setSaving(true);
      console.log('Saving profile for sellerId:', sellerId);
      console.log('Form data:', editFormData);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/sellers/${sellerId}/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(editFormData),
        }
      );

      const data = await response.json();
      console.log('Save response:', data);
      
      if (response.ok && data.success) {
        // Update seller state with new data
        setSeller(data.seller);
        setIsEditing(false);
        setShopNameError('');
        setShopNameValid(true);
        // Refresh the profile to show updated information
        await fetchSellerProfile();
        alert('Seller profile updated successfully! Changes will be reflected in the seller dashboard.');
      } else {
        alert(data.message || 'Failed to update seller profile');
        console.error('Error saving:', data);
      }
    } catch (error) {
      console.error('Error updating seller profile:', error);
      alert('Error updating seller profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original seller data
    if (seller) {
      setEditFormData({
        name: seller.name || '',
        email: seller.email || '',
        phone: seller.phone || seller.mobile || '',
        companyName: seller.companyName || '',
        shopName: seller.shopName || '',
        yearOfEstablishment: seller.yearOfEstablishment || '',
        numberOfEmployees: seller.numberOfEmployees || '',
        companyAddress: seller.companyAddress || '',
        factoryAddress: seller.factoryAddress || '',
        website: seller.website || '',
        aboutCompany: seller.aboutCompany || '',
        gstNumber: seller.gstNumber || '',
        pan: seller.pan || '',
        cin: seller.cin || '',
        contactPerson: seller.contactPerson ? {
          name: seller.contactPerson.name || '',
          designation: seller.contactPerson.designation || '',
          phone: seller.contactPerson.phone || '',
          email: seller.contactPerson.email || '',
        } : {
          name: '',
          designation: '',
          phone: '',
          email: '',
        },
      });
    }
  };

  const handleEditClick = () => {
    console.log('Edit button clicked, entering edit mode');
    // Ensure form data is initialized before entering edit mode
    if (seller) {
      setEditFormData({
        name: seller.name || '',
        email: seller.email || '',
        phone: seller.phone || seller.mobile || '',
        companyName: seller.companyName || '',
        shopName: seller.shopName || '',
        yearOfEstablishment: seller.yearOfEstablishment || '',
        numberOfEmployees: seller.numberOfEmployees || '',
        companyAddress: seller.companyAddress || '',
        factoryAddress: seller.factoryAddress || '',
        website: seller.website || '',
        aboutCompany: seller.aboutCompany || '',
        gstNumber: seller.gstNumber || '',
        pan: seller.pan || '',
        cin: seller.cin || '',
        contactPerson: seller.contactPerson ? {
          name: seller.contactPerson.name || '',
          designation: seller.contactPerson.designation || '',
          phone: seller.contactPerson.phone || '',
          email: seller.contactPerson.email || '',
        } : {
          name: '',
          designation: '',
          phone: '',
          email: '',
        },
      });
      setIsEditing(true);
    } else {
      console.error('Cannot enter edit mode: seller data not loaded');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading seller profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-4">
            <span className="material-symbols-outlined text-6xl text-red-300 mb-4">error</span>
            <p className="text-gray-900 font-semibold text-lg mb-2">Failed to Load Seller Profile</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500 mb-6">Seller ID: {sellerId}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/admin/sellers')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Back to Sellers
              </button>
              <button
                onClick={() => {
                  setError('');
                  setLoading(true);
                  fetchSellerProfile();
                  fetchSellerProducts();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!seller && !loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">person_off</span>
            <p className="text-gray-600 font-medium mb-4">Seller not found</p>
            <p className="text-sm text-gray-500 mb-6">Seller ID: {sellerId}</p>
            <button
              onClick={() => navigate('/admin/sellers')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Sellers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-x-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/admin/sellers')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-gray-600">arrow_back</span>
                </button>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Seller Profile
                  </h1>
                  <p className="text-gray-600 mt-1.5">{seller.companyName || seller.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {seller.suspended ? (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                    Suspended
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                    Active
                  </span>
                )}
                {!isEditing ? (
                  <button
                    onClick={handleEditClick}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving || !shopNameValid}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">save</span>
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-6">
          {/* Company Logo & Basic Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start gap-6">
              {seller.companyLogo?.url ? (
                <img
                  src={seller.companyLogo.url}
                  alt={seller.companyName || 'Company Logo'}
                  className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                  {seller.companyName?.[0]?.toUpperCase() || seller.name?.[0]?.toUpperCase() || 'S'}
                </div>
              )}
              <div className="flex-1">
                {isEditing ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={editFormData.name || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-3"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={editFormData.companyName || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Seller ID</p>
                        <p className="text-sm font-mono font-semibold text-purple-700">{seller.sellerId}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={editFormData.email || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="text"
                          value={editFormData.phone || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                        <input
                          type="text"
                          value={editFormData.gstNumber || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, gstNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {seller.companyName || seller.name}
                    </h2>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-500">Seller ID</p>
                        <p className="text-sm font-mono font-semibold text-purple-700">{seller.sellerId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{seller.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-sm text-gray-900">{seller.phone || seller.mobile || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">GST Number</p>
                        <p className="text-sm text-gray-900">{seller.gstNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-600">business</span>
              Company Information
            </h3>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
                    <textarea
                      value={editFormData.companyAddress || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, companyAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows="2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Factory Address</label>
                    <textarea
                      value={editFormData.factoryAddress || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, factoryAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows="2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year of Establishment</label>
                    <input
                      type="number"
                      value={editFormData.yearOfEstablishment || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, yearOfEstablishment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Employees</label>
                    <input
                      type="number"
                      value={editFormData.numberOfEmployees || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, numberOfEmployees: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={editFormData.website || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shop Name
                      {checkingShopName && (
                        <span className="ml-2 text-xs text-gray-500">(Checking...)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editFormData.shopName || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleShopNameChange(value);
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                        shopNameError
                          ? 'border-red-300 focus:ring-red-500'
                          : shopNameValid && editFormData.shopName && !checkingShopName
                          ? 'border-green-300 focus:ring-green-500'
                          : 'border-gray-300 focus:ring-purple-500'
                      }`}
                      placeholder="Enter unique shop name"
                    />
                    {shopNameError && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">error</span>
                        {shopNameError}
                      </p>
                    )}
                    {!shopNameError && shopNameValid && editFormData.shopName && !checkingShopName && (
                      <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Shop name is available
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">About Company</label>
                  <textarea
                    value={editFormData.aboutCompany || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, aboutCompany: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="4"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Company Address</p>
                    <p className="text-sm text-gray-900">{seller.companyAddress || 'N/A'}</p>
                  </div>
                  {seller.factoryAddress && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Factory Address</p>
                      <p className="text-sm text-gray-900">{seller.factoryAddress}</p>
                    </div>
                  )}
                  {seller.yearOfEstablishment && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Year of Establishment</p>
                      <p className="text-sm text-gray-900">{seller.yearOfEstablishment}</p>
                    </div>
                  )}
                  {seller.numberOfEmployees && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Number of Employees</p>
                      <p className="text-sm text-gray-900">{seller.numberOfEmployees}</p>
                    </div>
                  )}
                  {seller.website && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Website</p>
                      <a
                        href={seller.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {seller.website}
                      </a>
                    </div>
                  )}
                  {seller.shopName && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Shop Name</p>
                      <p className="text-sm text-gray-900">{seller.shopName}</p>
                    </div>
                  )}
                </div>
                {seller.aboutCompany && (
                  <div className="mt-6">
                    <p className="text-sm text-gray-500 mb-2">About Company</p>
                    <p className="text-sm text-gray-900 leading-relaxed">{seller.aboutCompany}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Contact Person */}
          {seller.contactPerson && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">person</span>
                Contact Person
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Name</p>
                  <p className="text-sm text-gray-900">{seller.contactPerson.name || 'N/A'}</p>
                </div>
                {seller.contactPerson.designation && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Designation</p>
                    <p className="text-sm text-gray-900">{seller.contactPerson.designation}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="text-sm text-gray-900">{seller.contactPerson.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-sm text-gray-900">{seller.contactPerson.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Legal Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-600">gavel</span>
              Legal Information
            </h3>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                  <input
                    type="text"
                    value={editFormData.gstNumber || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, gstNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={editFormData.pan || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, pan: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CIN Number</label>
                  <input
                    type="text"
                    value={editFormData.cin || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, cin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">GST Number</p>
                  <p className="text-sm text-gray-900 font-mono">{seller.gstNumber || 'N/A'}</p>
                </div>
                {seller.pan && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">PAN Number</p>
                    <p className="text-sm text-gray-900 font-mono">{seller.pan}</p>
                  </div>
                )}
                {seller.cin && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">CIN Number</p>
                    <p className="text-sm text-gray-900 font-mono">{seller.cin}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Certificates Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setExpandedSections(prev => ({ ...prev, certificates: !prev.certificates }))}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">verified</span>
                Certificates
                <span className="text-sm font-normal text-gray-500">
                  ({seller.certificates?.length || 0})
                </span>
              </h3>
              <span className="material-symbols-outlined text-gray-400">
                {expandedSections.certificates ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {expandedSections.certificates && (
              <div className="px-6 pb-6">
                {seller.certificates && seller.certificates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {seller.certificates.map((cert, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <img
                          src={cert.url}
                          alt={`Certificate ${index + 1}`}
                          className="w-full h-48 object-cover cursor-pointer"
                          onClick={() => window.open(cert.url, '_blank')}
                        />
                        <div className="p-3">
                          <p className="text-xs text-gray-500 truncate">
                            {cert.originalName || `Certificate ${index + 1}`}
                          </p>
                          {cert.uploadedAt && (
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(cert.uploadedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <span className="material-symbols-outlined text-6xl mb-4 opacity-50">verified</span>
                    <p>No certificates uploaded</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setExpandedSections(prev => ({ ...prev, documents: !prev.documents }))}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">description</span>
                Documents
                <span className="text-sm font-normal text-gray-500">
                  ({seller.documents?.length || 0})
                </span>
              </h3>
              <span className="material-symbols-outlined text-gray-400">
                {expandedSections.documents ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {expandedSections.documents && (
              <div className="px-6 pb-6">
                {seller.documents && seller.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {seller.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {doc.resourceType === 'image' || doc.format?.includes('image') ? (
                          <img
                            src={doc.url}
                            alt={`Document ${index + 1}`}
                            className="w-full h-48 object-cover cursor-pointer"
                            onClick={() => window.open(doc.url, '_blank')}
                          />
                        ) : (
                          <div
                            className="w-full h-48 bg-gradient-to-br from-purple-100 to-purple-200 flex flex-col items-center justify-center cursor-pointer hover:from-purple-200 hover:to-purple-300 transition-colors"
                            onClick={() => window.open(doc.url, '_blank')}
                          >
                            <span className="material-symbols-outlined text-6xl text-purple-600 mb-2">
                              description
                            </span>
                            <p className="text-sm text-purple-700 font-medium">View Document</p>
                          </div>
                        )}
                        <div className="p-3">
                          <p className="text-xs text-gray-500 truncate">
                            {doc.originalName || `Document ${index + 1}`}
                          </p>
                          {doc.format && (
                            <p className="text-xs text-gray-400 mt-1 uppercase">{doc.format}</p>
                          )}
                          {doc.uploadedAt && (
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <span className="material-symbols-outlined text-6xl mb-4 opacity-50">description</span>
                    <p>No documents uploaded</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Website Banners */}
          {seller.websiteBanners && seller.websiteBanners.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">image</span>
                Website Banners ({seller.websiteBanners.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {seller.websiteBanners.map((banner, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <img
                      src={banner.url}
                      alt={`Banner ${index + 1}`}
                      className="w-full h-32 object-cover cursor-pointer"
                      onClick={() => window.open(banner.url, '_blank')}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setExpandedSections(prev => ({ ...prev, products: !prev.products }))}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">inventory_2</span>
                Products
                <span className="text-sm font-normal text-gray-500">
                  ({products.length})
                </span>
              </h3>
              <span className="material-symbols-outlined text-gray-400">
                {expandedSections.products ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {expandedSections.products && (
              <div className="px-6 pb-6">
                {products.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <span className="material-symbols-outlined text-6xl mb-4 opacity-50">inventory</span>
                    <p>No products found for this seller</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <div
                        key={product._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-lg mb-3"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                            <span className="material-symbols-outlined text-6xl text-gray-400">image</span>
                          </div>
                        )}
                        <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.description || 'No description'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-purple-600">₹{product.price || '0'}</span>
                          {product.category && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {product.category}
                            </span>
                          )}
                        </div>
                        {product.stock !== undefined && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">
                              Stock: <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                                {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfileView;

