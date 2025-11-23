import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const ShopSectionPage = () => {
  const [searchParams] = useSearchParams();
  const [section, setSection] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sectionParam = searchParams.get('section');
    const dataParam = searchParams.get('data');
    
    if (sectionParam) {
      setSection(sectionParam);
      if (dataParam) {
        try {
          setData(JSON.parse(dataParam));
        } catch (e) {
          console.error('Error parsing data:', e);
        }
      }
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Section not found</h1>
          <p className="text-gray-600">The requested section could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {/* Certificates Section */}
          {section === 'certificates' && data && Array.isArray(data) && (
            <div>
              <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600">description</span>
                Certificates
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.map((cert, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="material-symbols-outlined text-blue-600 text-3xl">description</span>
                      <div className="flex-1">
                        <h3 className="font-semibold">{cert.originalName || `Certificate ${idx + 1}`}</h3>
                        {cert.uploadedAt && (
                          <p className="text-xs text-gray-500">
                            Uploaded: {new Date(cert.uploadedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <img
                        src={cert.url}
                        alt={cert.originalName || `Certificate ${idx + 1}`}
                        className="w-full h-auto rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div style={{ display: 'none' }} className="text-center py-8 text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2">description</span>
                        <p>Certificate preview not available</p>
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline mt-2 inline-block"
                        >
                          View Certificate
                        </a>
                      </div>
                    </div>
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <span>View Full Certificate</span>
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Factory Video Section */}
          {section === 'factory-video' && data && Array.isArray(data) && (
            <div>
              <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600">videocam</span>
                Factory Videos
              </h1>
              <div className="space-y-6">
                {data.map((video, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="material-symbols-outlined text-blue-600 text-3xl">videocam</span>
                      <div className="flex-1">
                        <h3 className="font-semibold">{video.originalName || `Factory Video ${idx + 1}`}</h3>
                        {video.uploadedAt && (
                          <p className="text-xs text-gray-500">
                            Uploaded: {new Date(video.uploadedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg overflow-hidden">
                      <video
                        src={video.url}
                        controls
                        className="w-full h-auto"
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <span>Open Video in New Tab</span>
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About Company Section */}
          {section === 'about' && data && data.aboutCompany && (
            <div>
              <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600">business</span>
                About Company
              </h1>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{data.aboutCompany}</p>
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="mt-8 pt-6 border-t">
            <button
              onClick={() => window.close()}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopSectionPage;

