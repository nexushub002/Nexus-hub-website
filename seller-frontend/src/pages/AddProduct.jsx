import React, { useState } from 'react'
import Sidebar from '../compo/Sidebar'
import { useSeller } from '../context/SellerContext'

const initialState = {
  name: '',
  category: '',
  subcategory: '',
  description: '',
  price: '',
  priceRangeMin: '',
  priceRangeMax: '',
  moq: '',
  sampleAvailable: false,
  samplePrice: '',
  hsCode: '',
  warranty: '',
  returnPolicy: '',
  customization: false,
  images: [], // Array of uploaded image files
  imageUrls: [] // Array of Cloudinary URLs after upload
}

// Define the same categories as in the backend
const CATEGORIES = {
  "Apparel & Accessories": [
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
  "Consumer Electronics": [
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
  "Jewelry": [
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
  ]
};

// Normalized key mapping for API/storage
const CATEGORY_KEY_MAP = {
  'Apparel & Accessories': 'Apparel_Accessories',
  'Consumer Electronics': 'Consumer_Electronics',
  'Jewelry': 'Jewelry'
}

const SUBCATEGORY_KEY_MAP = {
  'Apparel & Accessories': {
    "Men's Clothing": 'Men_Clothing',
    "Women's Clothing": 'Women_Clothing',
    "Children's Clothing": 'Children_Clothing',
    'Shoes & Footwear': 'Shoes_Footwear',
    'Bags & Handbags': 'Bags_Handbags',
    'Watches': 'Watches',
    'Belts & Accessories': 'Belts_Accessories',
    'Jewelry & Accessories': 'Jewelry_Accessories',
    'Sports & Activewear': 'Sports_Activewear',
    'Underwear & Lingerie': 'Underwear_Lingerie'
  },
  'Consumer Electronics': {
    'Mobile Phones & Accessories': 'Mobile_Phones_Accessories',
    'Computers & Laptops': 'Computers_Laptops',
    'Audio & Video Equipment': 'Audio_Video_Equipment',
    'Gaming Consoles & Accessories': 'Gaming_Consoles_Accessories',
    'Cameras & Photography': 'Cameras_Photography',
    'Home Appliances': 'Home_Appliances',
    'Smart Home Devices': 'Smart_Home_Devices',
    'Wearable Technology': 'Wearable_Technology',
    'Electronic Components': 'Electronic_Components',
    'Office Electronics': 'Office_Electronics'
  },
  'Jewelry': {
    'Rings': 'Rings',
    'Necklaces & Pendants': 'Necklaces_Pendants',
    'Earrings': 'Earrings',
    'Bracelets & Bangles': 'Bracelets_Bangles',
    'Watches': 'Watches',
    'Brooches & Pins': 'Brooches_Pins',
    'Anklets': 'Anklets',
    'Cufflinks': 'Cufflinks',
    'Tie Clips': 'Tie_Clips',
    'Jewelry Sets': 'Jewelry_Sets'
  }
}

const toKey = (label) =>
  (label || '')
    .replace(/&/g, ' ')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_{2,}/g, '_');

const AddProduct = () => {
  const [form, setForm] = useState(initialState)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { seller, isAuthenticated, loading } = useSeller()

  const handleToggleTheme = () => setIsDarkMode((v) => !v)

  const handleSwitchRole = () => {
    // Navigate to buyer app dev server
    window.location.href = 'http://localhost:5173/'
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Redirect if not authenticated (this should be handled by ProtectedRoute, but just in case)
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Please log in to access this page.</div>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleCategoryChange = (e) => {
    const category = e.target.value
    setForm((f) => ({ 
      ...f, 
      category: category,
      subcategory: '' // Reset subcategory when category changes
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setForm((f) => ({ 
      ...f, 
      images: [...f.images, ...files]
    }))
  }

  const removeImage = (index) => {
    setForm((f) => ({
      ...f,
      images: f.images.filter((_, i) => i !== index)
    }))
  }

  const uploadImagesToCloudinary = async (imageFiles) => {
    const uploadPromises = imageFiles.map(async (file) => {
      const formData = new FormData()
      formData.append('images', file)
      
      const response = await fetch('http://localhost:3000/api/upload/images', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to upload image')
      }
      
      const data = await response.json()
      return data.images[0] // Return the Cloudinary URL
    })
    
    return Promise.all(uploadPromises)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    try {
      // Check if seller is properly authenticated
      if (!seller || (!seller._id && !seller.id)) {
        setMessage('Error: Seller not authenticated. Please log in again.')
        return
      }

      console.log('Seller info:', seller) // Debug log

      // Upload images to Cloudinary first
      let imageUrls = []
      if (form.images.length > 0) {
        setMessage('Uploading images...')
        imageUrls = await uploadImagesToCloudinary(form.images)
      }

      // Resolve normalized keys for category and subcategory
      const categoryKey = CATEGORY_KEY_MAP[form.category] || toKey(form.category)
      const subcategoryKey = (SUBCATEGORY_KEY_MAP[form.category] && SUBCATEGORY_KEY_MAP[form.category][form.subcategory])
        ? SUBCATEGORY_KEY_MAP[form.category][form.subcategory]
        : toKey(form.subcategory)

      const sellerId = seller._id || seller.id // Handle both possible field names

      const body = {
        name: form.name,
        // Store both label and normalized key
        category: form.category,
        subcategory: form.subcategory,
        categoryKey,
        subcategoryKey,
        description: form.description,
        price: Number(form.price),
        priceRangeMin: Number(form.priceRangeMin) || undefined,
        priceRangeMax: Number(form.priceRangeMax) || undefined,
        moq: Number(form.moq),
        sampleAvailable: !!form.sampleAvailable,
        samplePrice: form.samplePrice ? Number(form.samplePrice) : undefined,
        manufacturerId: sellerId,
        hsCode: form.hsCode,
        warranty: form.warranty,
        returnPolicy: form.returnPolicy,
        customization: !!form.customization,
        images: imageUrls
      }

      console.log('Product data being sent:', body) // Debug log

      const res = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to create product')
      setMessage('Product created successfully')
      setForm(initialState)
    } catch (err) {
      setMessage(err.message)
    } finally {
      setSubmitting(false)
    }
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
              Add Product - {seller?.name || seller?.email || 'Seller'}
            </div>
          </div>

          {/* Add Product Form */}
          <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-2xl p-6 shadow-sm`}>
            <h1 className='text-xl font-semibold mb-4'>Create New Product</h1>
            {message && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                message.includes('successfully') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <input 
                className={`px-3 py-2 rounded border ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'}`} 
                name='name' 
                placeholder='Product Name' 
                value={form.name} 
                onChange={handleChange} 
                required 
              />
              <select 
                className={`px-3 py-2 rounded border ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'}`} 
                name='category' 
                value={form.category} 
                onChange={handleCategoryChange} 
                required 
              >
                <option value=''>Select Category</option>
                {Object.keys(CATEGORIES).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select 
                className={`px-3 py-2 rounded border ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'}`} 
                name='subcategory' 
                value={form.subcategory} 
                onChange={handleChange} 
                required 
                disabled={!form.category}
              >
                <option value=''>Select Subcategory</option>
                {form.category && CATEGORIES[form.category]?.map(subcategory => (
                  <option key={subcategory} value={subcategory}>{subcategory}</option>
                ))}
              </select>
              <input 
                className={`px-3 py-2 rounded border ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'}`} 
                name='price' 
                placeholder='Price' 
                type='number' 
                value={form.price} 
                onChange={handleChange} 
                required 
              />
              <input 
                className={`px-3 py-2 rounded border ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'}`} 
                name='moq' 
                placeholder='MOQ (Minimum Order Quantity)' 
                type='number' 
                value={form.moq} 
                onChange={handleChange} 
                required 
              />
              <input 
                className={`px-3 py-2 rounded border ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'}`} 
                name='priceRangeMin' 
                placeholder='Price Range Min' 
                type='number' 
                value={form.priceRangeMin} 
                onChange={handleChange} 
              />
              <input 
                className={`px-3 py-2 rounded border ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'}`} 
                name='priceRangeMax' 
                placeholder='Price Range Max' 
                type='number' 
                value={form.priceRangeMax} 
                onChange={handleChange} 
              />
              <input 
                className={`px-3 py-2 rounded border ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'}`} 
                name='samplePrice' 
                placeholder='Sample Price' 
                type='number' 
                value={form.samplePrice} 
                onChange={handleChange} 
              />
              <input 
                className={`px-3 py-2 rounded border md:col-span-2 ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'}`} 
                name='hsCode' 
                placeholder='HS Code' 
                value={form.hsCode} 
                onChange={handleChange} 
              />
              <input 
                className={`px-3 py-2 rounded border md:col-span-2 ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'}`} 
                name='warranty' 
                placeholder='Warranty' 
                value={form.warranty} 
                onChange={handleChange} 
              />
              <input 
                className={`px-3 py-2 rounded border md:col-span-2 ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'}`} 
                name='returnPolicy' 
                placeholder='Return Policy' 
                value={form.returnPolicy} 
                onChange={handleChange} 
              />
              <textarea 
                className={`px-3 py-2 rounded border md:col-span-2 ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'}`} 
                name='description' 
                placeholder='Product Description' 
                rows={4} 
                value={form.description} 
                onChange={handleChange} 
              />
              <div className='flex items-center gap-4 md:col-span-2'>
                <label className='flex items-center gap-2 text-sm'>
                  <input 
                    type='checkbox' 
                    name='sampleAvailable' 
                    checked={form.sampleAvailable} 
                    onChange={handleChange} 
                  /> 
                  Sample Available
                </label>
                <label className='flex items-center gap-2 text-sm'>
                  <input 
                    type='checkbox' 
                    name='customization' 
                    checked={form.customization} 
                    onChange={handleChange} 
                  /> 
                  Customization Available
                </label>
              </div>
              
              {/* Image Upload Section */}
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium mb-2'>Product Images</label>
                <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                  <input
                    type='file'
                    multiple
                    accept='image/*'
                    onChange={handleImageChange}
                    className='hidden'
                    id='image-upload'
                  />
                  <label
                    htmlFor='image-upload'
                    className='cursor-pointer flex flex-col items-center'
                  >
                    <svg className='w-12 h-12 text-gray-400 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' />
                    </svg>
                    <span className='text-sm text-gray-600'>
                      Click to upload images or drag and drop
                    </span>
                    <span className='text-xs text-gray-500 mt-1'>
                      PNG, JPG, JPEG up to 10MB each
                    </span>
                  </label>
                </div>
                
                {/* Display selected images */}
                {form.images.length > 0 && (
                  <div className='mt-4'>
                    <h4 className='text-sm font-medium mb-2'>Selected Images ({form.images.length})</h4>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                      {form.images.map((file, index) => (
                        <div key={index} className='relative group'>
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className='w-full h-24 object-cover rounded-lg border'
                          />
                          <button
                            type='button'
                            onClick={() => removeImage(index)}
                            className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600'
                          >
                            ×
                          </button>
                          <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg'>
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className='md:col-span-2'>
                <button 
                  disabled={submitting} 
                  className='px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 font-semibold'
                >
                  {submitting ? 'Creating Product...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AddProduct


