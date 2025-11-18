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
  imageUrls: [], // Array of Cloudinary URLs after upload
  videos: [], // Array of uploaded video files
  videoUrls: [] // Array of Cloudinary URLs after upload
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
    
    const fronted_url = `${import.meta.env.FRONTED_URL}`;

    window.location.href = fronted_url
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

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files)
    
    // Validate video files (max 100MB each)
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('video/')) {
        alert(`${file.name} is not a video file`)
        return false
      }
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        alert(`${file.name} is too large. Maximum size is 100MB`)
        return false
      }
      return true
    })
    
    setForm((f) => ({
      ...f,
      videos: [...f.videos, ...validFiles]
    }))
  }

  const removeVideo = (index) => {
    setForm((f) => ({
      ...f,
      videos: f.videos.filter((_, i) => i !== index)
    }))
  }

const uploadImagesToCloudinary = async (imageFiles) => {
  const uploadPromises = imageFiles.map(async (file) => {
    if (!file.type.startsWith('image/')) {
      throw new Error(`${file.name} is not a valid image file`)
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`${file.name} exceeds the 10MB size limit`)
    }

    const formData = new FormData()
    formData.append('images', file)
    
    const url = `${import.meta.env.VITE_API_BASE_URL}/api/upload/images`;

    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData
    })

    const data = await response.json().catch(() => ({}))
    
    if (!response.ok || !data.success || !Array.isArray(data.images) || !data.images.length) {
      throw new Error(data.message || `Failed to upload ${file.name}`)
    }
    
    return data.images[0] // Return the Cloudinary URL
  })
  
  return Promise.all(uploadPromises)
}

  const uploadVideosToCloudinary = async (videoFiles) => {
    const uploadPromises = videoFiles.map(async (file) => {
      const formData = new FormData()
      formData.append('videos', file)
      
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/upload/videos`;

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to upload video')
      }
      
      const data = await response.json()
      return data.videos[0] // Return the Cloudinary video URL
    })
    
    return Promise.all(uploadPromises)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    
    try {
      if (!seller || (!seller._id && !seller.id)) {
        throw new Error('Seller not authenticated. Please log in again.')
      }

      if (!form.name || !form.category || !form.subcategory || !form.price || !form.moq) {
        throw new Error('Please fill in all required fields (Name, Category, Subcategory, Price, MOQ)')
      }

      let imageUrls = []
      if (form.images.length > 0) {
        setMessage({ type: 'info', text: 'Uploading images...' })
        imageUrls = await uploadImagesToCloudinary(form.images)
      } else {
        throw new Error('Please upload at least one product image')
      }

      let videoUrls = []
      if (form.videos.length > 0) {
        setMessage({ type: 'info', text: 'Uploading videos...' })
        videoUrls = await uploadVideosToCloudinary(form.videos)
      }

      const categoryKey = CATEGORY_KEY_MAP[form.category] || toKey(form.category)
      const subcategoryKey = (SUBCATEGORY_KEY_MAP[form.category] && SUBCATEGORY_KEY_MAP[form.category][form.subcategory])
        ? SUBCATEGORY_KEY_MAP[form.category][form.subcategory]
        : toKey(form.subcategory)

      const sellerId = seller.sellerId
      if (!sellerId) {
        throw new Error('Seller ID not found. Please login again.')
      }

      const productData = {
        name: form.name.trim(),
        category: form.category,
        subcategory: form.subcategory,
        categoryKey,
        subcategoryKey,
        description: form.description?.trim() || '',
        price: Number(form.price),
        priceRangeMin: form.priceRangeMin ? Number(form.priceRangeMin) : undefined,
        priceRangeMax: form.priceRangeMax ? Number(form.priceRangeMax) : undefined,
        moq: Math.max(1, Number(form.moq) || 1),
        sampleAvailable: !!form.sampleAvailable,
        samplePrice: form.samplePrice ? Number(form.samplePrice) : undefined,
        sellerId,
        hsCode: form.hsCode?.trim(),
        warranty: form.warranty?.trim(),
        returnPolicy: form.returnPolicy?.trim(),
        customization: !!form.customization,
        images: imageUrls,
        videos: videoUrls
      };
      
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/products`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(productData)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create product');
      }
      
      await res.json();
      
      setMessage({ type: 'success', text: 'Product created successfully!' })
      setForm(initialState)
    } catch (err) {
      const errorMessage = err?.message || 'An error occurred while creating the product'
      setMessage({ type: 'error', text: errorMessage })
      console.error('Product creation error:', err)
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
                message.type === 'success' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {message.text}
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

              {/* Video Upload Section */}
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium mb-2'>Product Videos (Optional)</label>
                <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                  <input
                    type='file'
                    multiple
                    accept='video/*'
                    onChange={handleVideoChange}
                    className='hidden'
                    id='video-upload'
                  />
                  <label
                    htmlFor='video-upload'
                    className='cursor-pointer flex flex-col items-center'
                  >
                    <svg className='w-12 h-12 text-gray-400 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' />
                    </svg>
                    <span className='text-sm text-gray-600'>
                      Click to upload videos or drag and drop
                    </span>
                    <span className='text-xs text-gray-500 mt-1'>
                      MP4, MOV, AVI up to 100MB each
                    </span>
                  </label>
                </div>
                
                {/* Display selected videos */}
                {form.videos.length > 0 && (
                  <div className='mt-4'>
                    <h4 className='text-sm font-medium mb-2'>Selected Videos ({form.videos.length})</h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {form.videos.map((file, index) => (
                        <div key={index} className='relative group border rounded-lg p-4 bg-gray-50'>
                          <div className='flex items-center gap-3'>
                            <div className='flex-shrink-0'>
                              <svg className='w-12 h-12 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' />
                              </svg>
                            </div>
                            <div className='flex-1 min-w-0'>
                              <p className='text-sm font-medium text-gray-900 truncate'>
                                {file.name}
                              </p>
                              <p className='text-xs text-gray-500'>
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type='button'
                              onClick={() => removeVideo(index)}
                              className='flex-shrink-0 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600'
                            >
                              ×
                            </button>
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


