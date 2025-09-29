import React, { useState } from 'react';
import './CategoryList.css';

const CategoryList = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Categories data from Product.js model
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
      color: "#f8fafc",
      icon: "👕"
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
      color: "#eff6ff",
      icon: "📱"
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
      color: "#f1f5f9",
      icon: "💍"
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

  const handleSubcategoryClick = (subcategory) => {
    // Navigate to search results for this subcategory
    window.location.href = `/search?category=${encodeURIComponent(selectedCategory)}&subcategory=${encodeURIComponent(subcategory)}`;
  };

  return (
    <>
      <div className="category-list-container">
        <div className="category-section-title">
          <h2>Shop by Category</h2>
          <p>Discover amazing products across our top categories</p>
        </div>
        <div className="category-list">
          {Object.entries(categories).map(([categoryName, categoryData]) => (
            <div 
              key={categoryName} 
              className="category-card"
              style={{ backgroundColor: categoryData.color }}
            >
              <div className="category-header">
                <span className="category-icon">{categoryData.icon}</span>
                <h3 className="category-title">{categoryName}</h3>
              </div>
              
              <div className="subcategories-preview">
                {categoryData.subcategories.slice(0, 3).map((subcategory, index) => (
                  <div key={index} className="subcategory-item">
                    <span className="subcategory-icon">
                      {subcategoryIcons[subcategory] || "📦"}
                    </span>
                    <span className="subcategory-name">{subcategory}</span>
                  </div>
                ))}
              </div>
              
              <button 
                className="more-button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMoreClick(categoryName);
                }}
              >
                <span className="material-symbols-outlined">add</span>
                More
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for showing all subcategories */}
      {isModalOpen && selectedCategory && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <span className="category-icon">{categories[selectedCategory].icon}</span>
                {selectedCategory}
              </h2>
              <button className="close-button" onClick={closeModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="subcategories-grid">
                {categories[selectedCategory].subcategories.map((subcategory, index) => (
                  <div 
                    key={index} 
                    className="subcategory-card"
                    onClick={() => handleSubcategoryClick(subcategory)}
                  >
                    <span className="subcategory-icon-large">
                      {subcategoryIcons[subcategory] || "📦"}
                    </span>
                    <span className="subcategory-name-large">{subcategory}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CategoryList;

