import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CategoryList1 = () => {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Category data with icons and subcategories
  const categories = {
    "Apparel & Accessories": {
      icon: "https://rukminim1.flixcart.com/fk-p-flap/64/64/image/82b3ca5fb2301045.png?q=100",
      key: "Apparel_Accessories",
      subcategories: [
        { name: "Men's clothing", key: "Men_Clothing" },
        { name: "Women's clothing", key: "Women_Clothing" },
        { name: "Children's clothing", key: "Children_Clothing" },
        { name: "Shoes & Footwear", key: "Shoes_Footwear" },
        { name: "Bags & Handbags", key: "Bags_Handbags" },
        { name: "Watches", key: "Watches" },
        { name: "Belts & Accessories", key: "Belts_Accessories" },
        { name: "Jewelry & Accessories", key: "Jewelry_Accessories" },
        { name: "Sports & Activewear", key: "Sports_Activewear" },
        { name: "Underwear & Lingerie", key: "Underwear_Lingerie" }
      ]
    },
    "Consumer Electronics": {
      icon: "https://rukminim1.flixcart.com/fk-p-flap/64/64/image/69c6589653afdb9a.png?q=100",
      key: "Consumer_Electronics",
      subcategories: [
        { name: "Mobile Phones & accessories", key: "Mobile_Phones_Accessories" },
        { name: "Computers & Laptops", key: "Computers_Laptops" },
        { name: "Audio & Video Equipment", key: "Audio_Video_Equipment" },
        { name: "Gaming Consoles & Accessories", key: "Gaming_Consoles_Accessories" },
        { name: "Cameras & Photography", key: "Cameras_Photography" },
        { name: "Home Appliances", key: "Home_Appliances" },
        { name: "Smart Home Devices", key: "Smart_Home_Devices" },
        { name: "Wearable Technology", key: "Wearable_Technology" },
        { name: "Electronic Components", key: "Electronic_Components" },
        { name: "Office Electronics", key: "Office_Electronics" }
      ]
    },
    "Jewelry": {
      icon: "https://rukminim1.flixcart.com/fk-p-flap/64/64/image/f15c02bfeb02d15d.png?q=100",
      key: "Jewelry",
      subcategories: [
        { name: "Rings", key: "Rings" },
        { name: "Necklaces & Pendants", key: "Necklaces_Pendants" },
        { name: "Earrings", key: "Earrings" },
        { name: "Bracelets & Bangles", key: "Bracelets_Bangles" },
        { name: "Watches", key: "Watches" },
        { name: "Brooches & Pins", key: "Brooches_Pins" },
        { name: "Anklets", key: "Anklets" },
        { name: "Cufflinks", key: "Cufflinks" },
        { name: "Tie clips", key: "Tie_Clips" },
        { name: "Jewelry Sets", key: "Jewelry_Sets" }
      ]
    }
  }

  const handleCategoryClick = (categoryName) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null) // Close if already open
    } else {
      setSelectedCategory(categoryName) // Open subcategories
    }
  }

  const handleSubcategoryClick = (categoryKey, subcategoryKey) => {
    navigate(`/browse/${categoryKey}/${subcategoryKey}`)
  }

  return (
    <div className='bg-[#FFFFFF] p-4 m-4 rounded-lg shadow-md'>
      {/* Main Categories */}
      <div className='flex space-x-4 items-center justify-center mb-4'>
        {Object.entries(categories).map(([categoryName, categoryData]) => (
          <div 
            key={categoryName}
            className={`bg-[#E3E6E6] w-1/3 h-[120px] rounded-xl px-4 py-3 flex flex-col items-center justify-center cursor-pointer hover:bg-[#D1D5DB] transition-colors ${
              selectedCategory === categoryName ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleCategoryClick(categoryName)}
          >
            <img 
              src={categoryData.icon} 
              alt={categoryName}
              className="w-16 h-16 mb-2"
            />
            <p className='font-bold text-center text-sm'>{categoryName}</p>
          </div>
        ))}
      </div>

      {/* Subcategories */}
      {selectedCategory && (
        <div className='bg-[#F9FAFB] rounded-lg p-4 border-t-2 border-blue-500'>
          <h3 className='font-bold text-lg mb-3 text-center'>{selectedCategory} - Subcategories</h3>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3'>
            {categories[selectedCategory].subcategories.map((subcategory) => (
              <div
                key={subcategory.key}
                className='bg-white p-3 rounded-lg shadow-sm hover:shadow-md cursor-pointer hover:bg-blue-50 transition-all border border-gray-200'
                onClick={() => handleSubcategoryClick(categories[selectedCategory].key, subcategory.key)}
              >
                <p className='text-sm font-medium text-center text-gray-700 hover:text-blue-600'>
                  {subcategory.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryList1;