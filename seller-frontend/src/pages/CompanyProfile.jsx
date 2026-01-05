import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const CompanyProfile = () => {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        console.log('Fetching company profile for sellerId:', sellerId);
        setLoading(true);
        
        const profileResponse = await fetch(`/api/seller-profile/public/${sellerId}`);
        
        console.log('Profile response status:', profileResponse.status);

        const profileData = await profileResponse.json();

        console.log('Profile data:', profileData);

        if (profileResponse.ok && profileData.success) {
          setSeller(profileData.seller);
          // Certificates are included in the seller profile
          setCertificates(profileData.seller.certificates || []);
        } else {
          throw new Error(profileData.message || 'Seller not found.');
        }
      } catch (err) {
        console.error('Error loading company profile:', err);
        setError(err.message || 'Unable to load company profile.');
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchSellerProfile();
    } else {
      setError('No seller ID provided');
      setLoading(false);
    }
  }, [sellerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <span className="material-symbols-outlined text-red-600 text-4xl mb-4">error</span>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Link 
              to={`/seller/${sellerId}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
   
       <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to={`/seller/${sellerId}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
               <span className="material-symbols-outlined">arrow_back</span>
                 Back to Shop
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
            <div></div>
          </div>
        </div>
       </div>
       
       </div>
    // <div className="min-h-screen bg-gray-50">
    //   {/* Header */}
    //   <div className="bg-white border-b">
    //     <div className="max-w-7xl mx-auto px-4 py-4">
    //       <div className="flex items-center justify-between">
    //         <Link 
    //           to={`/seller/${sellerId}`}
    //           className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
    //         >
    //           <span className="material-symbols-outlined">arrow_back</span>
    //           Back to Shop
    //         </Link>
    //         <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
    //         <div></div>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Main Content */}
    //   <div className="max-w-7xl mx-auto px-4 py-8">
    //     <div className="grid lg:grid-cols-3 gap-8">
    //       {/* Company Information */}
    //       <div className="lg:col-span-2 space-y-6">
    //         

    //         {/* Company Details */}
    //         <div className="bg-white rounded-2xl shadow-sm p-6">
    //           <h3 className="text-xl font-bold text-gray-900 mb-6">Company Details</h3>
    //           <div className="grid md:grid-cols-2 gap-6">
    //             <div className="space-y-4">
    //               {seller.companyAddress && (
    //                 <div className="flex items-start gap-3">
    //                   <span className="material-symbols-outlined text-blue-600 mt-1">location_on</span>
    //                   <div>
    //                     <p className="font-medium text-gray-900">Address</p>
    //                     <p className="text-gray-600">{seller.companyAddress}</p>
    //                   </div>
    //                 </div>
    //               )}
    //               {seller.businessType && (
    //                 <div className="flex items-start gap-3">
    //                   <span className="material-symbols-outlined text-blue-600 mt-1">business</span>
    //                   <div>
    //                     <p className="font-medium text-gray-900">Business Type</p>
    //                     <p className="text-gray-600 capitalize">{seller.businessType}</p>
    //                   </div>
    //                 </div>
    //               )}
    //               {seller.annualRevenue && (
    //                 <div className="flex items-start gap-3">
    //                   <span className="material-symbols-outlined text-blue-600 mt-1">payments</span>
    //                   <div>
    //                     <p className="font-medium text-gray-900">Annual Revenue</p>
    //                     <p className="text-gray-600">{seller.annualRevenue}</p>
    //                   </div>
    //                 </div>
    //               )}
    //             </div>
    //             <div className="space-y-4">
    //               {seller.website && (
    //                 <div className="flex items-start gap-3">
    //                   <span className="material-symbols-outlined text-blue-600 mt-1">language</span>
    //                   <div>
    //                     <p className="font-medium text-gray-900">Website</p>
    //                     <a 
    //                       href={seller.website} 
    //                       target="_blank" 
    //                       rel="noopener noreferrer"
    //                       className="text-blue-600 hover:text-blue-700 underline"
    //                     >
    //                       {seller.website}
    //                     </a>
    //                   </div>
    //                 </div>
    //               )}
    //               {seller.email && (
    //                 <div className="flex items-start gap-3">
    //                   <span className="material-symbols-outlined text-blue-600 mt-1">email</span>
    //                   <div>
    //                     <p className="font-medium text-gray-900">Email</p>
    //                     <a 
    //                       href={`mailto:${seller.email}`}
    //                       className="text-blue-600 hover:text-blue-700"
    //                     >
    //                       {seller.email}
    //                     </a>
    //                   </div>
    //                 </div>
    //               )}
    //               {seller.phone && (
    //                 <div className="flex items-start gap-3">
    //                   <span className="material-symbols-outlined text-blue-600 mt-1">phone</span>
    //                   <div>
    //                     <p className="font-medium text-gray-900">Phone</p>
    //                     <a 
    //                       href={`tel:${seller.phone}`}
    //                       className="text-blue-600 hover:text-blue-700"
    //                     >
    //                       {seller.phone}
    //                     </a>
    //                   </div>
    //                 </div>
    //               )}
    //             </div>
    //           </div>
    //         </div>

    //         {/* Products & Services */}
    //         <div className="bg-white rounded-2xl shadow-sm p-6">
    //           <h3 className="text-xl font-bold text-gray-900 mb-6">Products & Services</h3>
    //           <div className="grid md:grid-cols-2 gap-4">
    //             <div className="p-4 bg-blue-50 rounded-xl">
    //               <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
    //                 <span className="material-symbols-outlined text-white text-xl">inventory_2</span>
    //               </div>
    //               <h4 className="font-semibold text-gray-900 mb-2">Quality Products</h4>
    //               <p className="text-gray-600 text-sm">Wide range of high-quality products manufactured with premium materials and strict quality control.</p>
    //             </div>
    //             <div className="p-4 bg-green-50 rounded-xl">
    //               <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-3">
    //                 <span className="material-symbols-outlined text-white text-xl">precision_manufacturing</span>
    //               </div>
    //               <h4 className="font-semibold text-gray-900 mb-2">Advanced Manufacturing</h4>
    //               <p className="text-gray-600 text-sm">State-of-the-art production facilities with advanced technology and skilled workforce.</p>
    //             </div>
    //             <div className="p-4 bg-purple-50 rounded-xl">
    //               <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-3">
    //                 <span className="material-symbols-outlined text-white text-xl">local_shipping</span>
    //               </div>
    //               <h4 className="font-semibold text-gray-900 mb-2">Global Delivery</h4>
    //               <p className="text-gray-600 text-sm">Efficient logistics network ensuring timely delivery to customers worldwide.</p>
    //             </div>
    //             <div className="p-4 bg-orange-50 rounded-xl">
    //               <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-3">
    //                 <span className="material-symbols-outlined text-white text-xl">support_agent</span>
    //               </div>
    //               <h4 className="font-semibold text-gray-900 mb-2">Customer Support</h4>
    //               <p className="text-gray-600 text-sm">Dedicated customer service team providing excellent support and after-sales service.</p>
    //             </div>
    //           </div>
    //         </div>
    //       </div>

    //       {/* Sidebar */}
    //       <div className="space-y-6">
    //         {/* Certifications */}
    //         {certificates.length > 0 && (
    //           <div className="bg-white rounded-2xl shadow-sm p-6">
    //             <h3 className="text-lg font-bold text-gray-900 mb-4">Certifications</h3>
    //             <div className="space-y-3">
    //               {certificates.map((cert, index) => (
    //                 <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
    //                   <span className="material-symbols-outlined text-blue-600">description</span>
    //                   <div className="flex-1">
    //                     <p className="font-medium text-gray-900 text-sm">{cert.originalName}</p>
    //                     <p className="text-gray-500 text-xs">
    //                       {cert.format.toUpperCase()} • {new Date(cert.uploadedAt).toLocaleDateString()}
    //                     </p>
    //                   </div>
    //                   <a
    //                     href={cert.url}
    //                     target="_blank"
    //                     rel="noopener noreferrer"
    //                     className="text-blue-600 hover:text-blue-700"
    //                     title="View certificate"
    //                   >
    //                     <span className="material-symbols-outlined text-sm">open_in_new</span>
    //                   </a>
    //                 </div>
    //               ))}
    //             </div>
    //           </div>
    //         )}

    //         {/* Quick Actions */}
    //         <div className="bg-white rounded-2xl shadow-sm p-6">
    //           <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
    //           <div className="space-y-3">
    //             <Link
    //               to={`/seller/${sellerId}`}
    //               className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    //             >
    //               <span className="material-symbols-outlined text-sm">store</span>
    //               View Products
    //             </Link>
    //             {seller.phone && (
    //               <a
    //                 href={`tel:${seller.phone}`}
    //                 className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
    //               >
    //                 <span className="material-symbols-outlined text-sm">call</span>
    //                 Call Now
    //               </a>
    //             )}
    //             {seller.email && (
    //               <a
    //                 href={`mailto:${seller.email}`}
    //                 className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
    //               >
    //                 <span className="material-symbols-outlined text-sm">email</span>
    //                 Send Email
    //               </a>
    //             )}
    //           </div>
    //         </div>

    //         {/* Business Highlights */}
    //         <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
    //           <h3 className="text-lg font-bold text-blue-900 mb-4">Business Highlights</h3>
    //           <div className="space-y-3">
    //             <div className="flex items-center gap-3">
    //               <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
    //                 <span className="material-symbols-outlined text-white text-sm">trending_up</span>
    //               </div>
    //               <div>
    //                 <p className="font-medium text-blue-900">Growing Business</p>
    //                 <p className="text-blue-700 text-sm">Expanding market reach</p>
    //               </div>
    //             </div>
    //             <div className="flex items-center gap-3">
    //               <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
    //                 <span className="material-symbols-outlined text-white text-sm">verified</span>
    //               </div>
    //               <div>
    //                 <p className="font-medium text-blue-900">Trusted Partner</p>
    //                 <p className="text-blue-700 text-sm">Reliable quality service</p>
    //               </div>
    //             </div>
    //             <div className="flex items-center gap-3">
    //               <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
    //                 <span className="material-symbols-outlined text-white text-sm">eco</span>
    //               </div>
    //               <div>
    //                 <p className="font-medium text-blue-900">Sustainable</p>
    //                 <p className="text-blue-700 text-sm">Eco-friendly practices</p>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
};

export default CompanyProfile;
