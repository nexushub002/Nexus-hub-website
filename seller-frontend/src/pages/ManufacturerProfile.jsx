import React, { useState, useEffect } from 'react';
import { useSeller } from '../context/SellerContext';
import Sidebar from '../compo/Sidebar';

const ManufacturerProfile = () => {
  const { seller, isAuthenticated, loading } = useSeller();
  const [manufacturerData, setManufacturerData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [uploadingCertificates, setUploadingCertificates] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleToggleTheme = () => setIsDarkMode((v) => !v);

  const handleSwitchRole = () => {
    window.location.href = 'http://localhost:5173/';
  };

  // Fetch manufacturer profile
  useEffect(() => {
    if (isAuthenticated && seller) {
      fetchManufacturerProfile();
    }
  }, [isAuthenticated, seller]);

  const fetchManufacturerProfile = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/seller/profile', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setManufacturerData(data.seller.manufacturerProfile);
        setFormData(data.seller.manufacturerProfile);
      }
    } catch (error) {
      console.error('Error fetching manufacturer profile:', error);
      setMessage('Error loading manufacturer profile');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/seller/manufacturer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setManufacturerData(data.manufacturer);
        setIsEditing(false);
        setMessage('Profile updated successfully');
      } else {
        setMessage(data.message || 'Error updating profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile');
    }
  };

  const uploadDocuments = async (files) => {
    setUploadingDocuments(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('documents', file);
      });

      const uploadResponse = await fetch('http://localhost:3000/api/upload/documents', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const uploadData = await uploadResponse.json();
      if (uploadData.success) {
        // Add documents to manufacturer profile
        const addResponse = await fetch('http://localhost:3000/api/seller/manufacturer/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ documents: uploadData.documents })
        });

        const addData = await addResponse.json();
        if (addData.success) {
          setManufacturerData(prev => ({
            ...prev,
            documents: addData.documents
          }));
          setMessage('Documents uploaded successfully');
        }
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      setMessage('Error uploading documents');
    } finally {
      setUploadingDocuments(false);
    }
  };

  const uploadCertificates = async (files) => {
    setUploadingCertificates(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('certificates', file);
      });

      const uploadResponse = await fetch('http://localhost:3000/api/upload/certificates', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const uploadData = await uploadResponse.json();
      if (uploadData.success) {
        // Add certificates to manufacturer profile
        const addResponse = await fetch('http://localhost:3000/api/seller/manufacturer/certificates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ certificates: uploadData.certificates })
        });

        const addData = await addResponse.json();
        if (addData.success) {
          setManufacturerData(prev => ({
            ...prev,
            certificates: addData.certificates
          }));
          setMessage('Certificates uploaded successfully');
        }
      }
    } catch (error) {
      console.error('Error uploading certificates:', error);
      setMessage('Error uploading certificates');
    } finally {
      setUploadingCertificates(false);
    }
  };

  const uploadLogo = async (file) => {
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const uploadResponse = await fetch('http://localhost:3000/api/upload/logo', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const uploadData = await uploadResponse.json();
      if (uploadData.success) {
        // Update logo in manufacturer profile
        const updateResponse = await fetch('http://localhost:3000/api/seller/manufacturer/logo', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ logo: uploadData.logo })
        });

        const updateData = await updateResponse.json();
        if (updateData.success) {
          setManufacturerData(prev => ({
            ...prev,
            companyLogo: updateData.logo
          }));
          setMessage('Logo updated successfully');
        }
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      setMessage('Error uploading logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const deleteDocument = async (documentId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/seller/manufacturer/documents/${documentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        setManufacturerData(prev => ({
          ...prev,
          documents: prev.documents.filter(doc => doc._id !== documentId)
        }));
        setMessage('Document deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      setMessage('Error deleting document');
    }
  };

  const deleteCertificate = async (certificateId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/seller/manufacturer/certificates/${certificateId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        setManufacturerData(prev => ({
          ...prev,
          certificates: prev.certificates.filter(cert => cert._id !== certificateId)
        }));
        setMessage('Certificate deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting certificate:', error);
      setMessage('Error deleting certificate');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Please log in to access this page.</div>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'bg-[#eef1f7]/0 text-white' : 'bg-[#f5f7fb] text-[#0f172a]'} min-h-screen`}>
      <div className='flex'>
        <Sidebar
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          onSwitchRole={handleSwitchRole}
        />

        <main className='flex-1 p-6'>
          {/* Top bar */}
          <div className='flex items-center justify-between mb-6'>
            <div className='text-2xl font-semibold'>
              Manufacturer Profile - {seller?.name || seller?.email || 'Seller'}
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.includes('successfully') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {manufacturerData && (
            <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-2xl p-6 shadow-sm space-y-8`}>
              
              {/* Company Logo Section */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Company Logo</h2>
                <div className="flex items-center space-x-4">
                  {manufacturerData.companyLogo?.url && (
                    <img 
                      src={manufacturerData.companyLogo.url} 
                      alt="Company Logo" 
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files[0] && uploadLogo(e.target.files[0])}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Company Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-700">{manufacturerData.companyName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Year of Establishment</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="yearOfEstablishment"
                        value={formData.yearOfEstablishment || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-700">{manufacturerData.yearOfEstablishment}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Employees</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="numberOfEmployees"
                        value={formData.numberOfEmployees || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-700">{manufacturerData.numberOfEmployees}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Years in Business</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="yearsInBusiness"
                        value={formData.yearsInBusiness || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-700">{manufacturerData.yearsInBusiness}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Company Address</label>
                    {isEditing ? (
                      <textarea
                        name="companyAddress"
                        value={formData.companyAddress || ''}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-700">{manufacturerData.companyAddress}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Factory Address</label>
                    {isEditing ? (
                      <textarea
                        name="factoryAddress"
                        value={formData.factoryAddress || ''}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-700">{manufacturerData.factoryAddress || 'Not provided'}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">About Company</label>
                    {isEditing ? (
                      <textarea
                        name="aboutCompany"
                        value={formData.aboutCompany || ''}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-700">{manufacturerData.aboutCompany || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    {isEditing ? (
                      <input
                        type="url"
                        name="website"
                        value={formData.website || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-700">
                        {manufacturerData.website ? (
                          <a href={manufacturerData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {manufacturerData.website}
                          </a>
                        ) : 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Person */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Contact Person</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="contactPerson.name"
                        value={formData.contactPerson?.name || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-700">{manufacturerData.contactPerson?.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Designation</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="contactPerson.designation"
                        value={formData.contactPerson?.designation || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-700">{manufacturerData.contactPerson?.designation}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="contactPerson.phone"
                        value={formData.contactPerson?.phone || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-700">{manufacturerData.contactPerson?.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="contactPerson.email"
                        value={formData.contactPerson?.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-700">{manufacturerData.contactPerson?.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Legal Information */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Legal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">GSTIN</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="gstin"
                        value={formData.gstin || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-700">{manufacturerData.gstin || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">CIN</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="cin"
                        value={formData.cin || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-700">{manufacturerData.cin || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">PAN</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="pan"
                        value={formData.pan || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-700">{manufacturerData.pan || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="border-b pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Documents</h2>
                  <div>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => e.target.files.length > 0 && uploadDocuments(e.target.files)}
                      className="hidden"
                      id="documents-upload"
                    />
                    <label
                      htmlFor="documents-upload"
                      className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      {uploadingDocuments ? 'Uploading...' : 'Upload Documents'}
                    </label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {manufacturerData.documents?.map((doc, index) => (
                    <div key={doc._id || index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium truncate">{doc.originalName}</p>
                          <p className="text-sm text-gray-500">{doc.format?.toUpperCase()}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View
                          </a>
                          <button
                            onClick={() => deleteDocument(doc._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificates Section */}
              <div className="border-b pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Certificates</h2>
                  <div>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => e.target.files.length > 0 && uploadCertificates(e.target.files)}
                      className="hidden"
                      id="certificates-upload"
                    />
                    <label
                      htmlFor="certificates-upload"
                      className="cursor-pointer px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      {uploadingCertificates ? 'Uploading...' : 'Upload Certificates'}
                    </label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {manufacturerData.certificates?.map((cert, index) => (
                    <div key={cert._id || index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium truncate">{cert.originalName}</p>
                          <p className="text-sm text-gray-500">{cert.format?.toUpperCase()}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(cert.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <a
                            href={cert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View
                          </a>
                          <button
                            onClick={() => deleteCertificate(cert._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManufacturerProfile;
