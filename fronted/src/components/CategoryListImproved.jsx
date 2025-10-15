import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryListImproved = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Simplified categories data with better structure
  const categories = {
    "Apparel & Accessories": {
      subcategories: [
        "Men's Clothing",
        "Women's Clothing", 
        "Children's Clothing",
        "Shoes & Footwear",
        "Bags & Handbags",
        "Watches",
        "Belts & Accessories",
        "Jewelry & Accessories",
        "Sports & Activewear",
        "Underwear & Lingerie"
      ],
      icon: "👕",
      color: "#3b82f6"
    },
    "Consumer Electronics": {
      subcategories: [
        "Mobile Phones & Accessories",
        "Computers & Laptops",
        "Audio & Video Equipment",
        "Gaming Consoles & Accessories",
        "Cameras & Photography",
        "Home Appliances",
        "Smart Home Devices",
        "Wearable Technology",
        "Electronic Components",
        "Office Electronics"
      ],
      icon: "📱",
      color: "#10b981"
    },
    "Jewelry": {
      subcategories: [
        "Rings",
        "Necklaces & Pendants",
        "Earrings",
        "Bracelets & Bangles",
        "Watches",
        "Brooches & Pins",
        "Anklets",
        "Cufflinks",
        "Tie Clips",
        "Jewelry Sets"
      ],
      icon: "💍",
      color: "#8b5cf6"
    }
  };

  // Icon mapping for subcategories
  const subcategoryIcons = {
    // Apparel & Accessories
    "Men's Clothing": "👔",
    "Women's Clothing": "👗",
    "Children's Clothing": "👶",
    "Shoes & Footwear": "👟",
    "Bags & Handbags": "👜",
    "Watches": "⌚",
    "Belts & Accessories": "🔗",
    "Jewelry & Accessories": "💎",
    "Sports & Activewear": "🏃",
    "Underwear & Lingerie": "👙",
    
    // Consumer Electronics
    "Mobile Phones & Accessories": "📱",
    "Computers & Laptops": "💻",
    "Audio & Video Equipment": "🎧",
    "Gaming Consoles & Accessories": "🎮",
    "Cameras & Photography": "📷",
    "Home Appliances": "🏠",
    "Smart Home Devices": "🏡",
    "Wearable Technology": "⌚",
    "Electronic Components": "🔌",
    "Office Electronics": "🖥️",
    
    // Jewelry
    "Rings": "💍",
    "Necklaces & Pendants": "📿",
    "Earrings": "👂",
    "Bracelets & Bangles": "🔗",
    "Brooches & Pins": "📌",
    "Anklets": "🦶",
    "Cufflinks": "👔",
    "Tie Clips": "👔",
    "Jewelry Sets": "💎"
  };

  const handleMoreClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handleSubcategoryClick = (category, subcategory) => {
    // Simple search-based navigation that will work reliably
    const searchQuery = `category:"${category}" subcategory:"${subcategory}"`;
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    closeModal();
  };

  const handleCategoryClick = (categoryName) => {
    // Navigate to category page
    navigate(`/search?q=${encodeURIComponent(categoryName)}`);
  };

  return (
    <>
      <div className="w-full bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Shop by Category</h2>
            <p className="text-gray-600 text-lg">Discover amazing products across our top categories</p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(categories).map(([categoryName, categoryData]) => (
              <div 
                key={categoryName} 
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${categoryData.color}15`, color: categoryData.color }}
                  >
                    {categoryData.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{categoryName}</h3>
                </div>
                
                {/* Subcategories Preview */}
                <div className="space-y-3 mb-6">
                  {categoryData.subcategories.slice(0, 3).map((subcategory, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSubcategoryClick(categoryName, subcategory)}
                    >
                      <span className="text-lg">
                        {subcategoryIcons[subcategory] || "📦"}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{subcategory}</span>
                    </div>
                  ))}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleMoreClick(categoryName)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                    More
                  </button>
                  <button 
                    onClick={() => handleCategoryClick(categoryName)}
                    className="flex-1 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                    style={{ backgroundColor: categoryData.color }}
                  >
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    View All
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for showing all subcategories */}
      {isModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ 
                    backgroundColor: `${categories[selectedCategory].color}15`, 
                    color: categories[selectedCategory].color 
                  }}
                >
                  {categories[selectedCategory].icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedCategory}</h2>
              </div>
              <button 
                onClick={closeModal}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-gray-600">close</span>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 max-h-[calc(85vh-120px)] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories[selectedCategory].subcategories.map((subcategory, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                    onClick={() => handleSubcategoryClick(selectedCategory, subcategory)}
                  >
                    <span className="text-3xl mb-3">
                      {subcategoryIcons[subcategory] || "📦"}
                    </span>
                    <span className="text-sm font-medium text-gray-700 text-center leading-tight">
                      {subcategory}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryListImproved;