import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../compo/Sidebar'
import { useSeller } from '../context/SellerContext'
import { useSellerTracking } from '../hooks/useSellerTracking'
import InquiryManagement from '../components/InquiryManagement'
import MobileNav from '../components/MobileNav'
import ProductCreationForm from '../components/ProductCreationForm'
import './Sellerdashboard.css'

// Helpers: generate deterministic color and initial for avatar
const getInitial = (nameOrEmail) => {
  if (!nameOrEmail) return 'S'
  const trimmed = nameOrEmail.trim()
  return trimmed.charAt(0).toUpperCase()
}

const stringToColor = (str = 'seller') => {
  // Simple hash -> HSL color for consistent backgrounds per seller
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash) % 360
  return `hsl(${h}, 70%, 40%)`
}

const Sellerdashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [products, setProducts] = useState([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  })
  
  const { seller, isAuthenticated, loading } = useSeller()
  const { trackPageView, trackProductActivity, trackDashboardActivity } = useSellerTracking()
  const navigate = useNavigate()

  // Track page view and load data on mount
  useEffect(() => {
    if (seller) {
      trackPageView('seller_dashboard', { tab: activeTab })
      fetchDashboardData()
    }
  }, [seller, activeTab])

  const handleToggleTheme = () => setIsDarkMode((v) => !v)

  const handleSwitchRole = () => {
    trackDashboardActivity('switch_role', { target: 'buyer' })

    const url = `${import.meta.env.VITE_FRONTED_URL}`;

    window.location.href = url
  }

  const fetchDashboardData = async () => {
    if (!seller) return
    
    try {

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/seller/products/dashboard-stats`;

      const response = await fetch(url , {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardStats(data.stats || dashboardStats)
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  // Product creation is handled on dedicated Add Product page

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    trackDashboardActivity('tab_change', { tab })
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  // Redirect if not authenticated (this should be handled by ProtectedRoute, but just in case)
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Please log in to access the dashboard.</div>
      </div>
    )
  }

  // Add viewport meta tag for mobile optimization
  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]')
    if (!viewport) {
      const meta = document.createElement('meta')
      meta.name = 'viewport'
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      document.getElementsByTagName('head')[0].appendChild(meta)
    }
  }, [])

  return (
    <div className={`${isDarkMode ? 'bg-[#eef1f7]/0 text-white' : 'bg-[#f5f7fb] text-[#0f172a]'} min-h-screen mobile-dashboard-container`}> 
      <div className='flex'>
        <Sidebar
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          onSwitchRole={handleSwitchRole}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={setIsMobileMenuOpen}
        />

        <main className='flex-1 p-3 sm:p-4 lg:p-6 lg:ml-0 pb-20 lg:pb-6 transition-all duration-300'>
          {/* Mobile Header with Hamburger */}
          <div className='lg:hidden flex items-center justify-between mb-4 p-3 bg-white rounded-lg shadow-sm mobile-touch-target fade-in'>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className='p-2 rounded-lg hover:bg-gray-100 transition-colors mobile-touch-target'
              aria-label='Open menu'
              role='button'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
            <div className='font-semibold text-lg'>Dashboard</div>
            <button onClick={handleSwitchRole} className='text-sm bg-blue-600 text-white px-3 py-2 rounded-lg mobile-touch-target transition-all hover:bg-blue-700 active:scale-95'>
              Switch
            </button>
          </div>

          {/* Desktop Top bar */}
          <div className='hidden lg:flex items-center justify-between mb-6'>
            <div className='space-y-1'>
              <div className='text-2xl font-semibold'>
                Welcome back, {seller?.name || 'Seller'}! 👋
              </div>
              <div className='text-sm text-gray-500'>
                {seller?.businessName && (
                  <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium mr-2'>
                    {seller.businessName}
                  </span>
                )}
                <span>Manage your business from here</span>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-xl px-3 py-2`}>🔔</div>
              <div className={`flex items-center gap-2 ${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-xl px-3 py-2`}>
                <span className='opacity-70'>Search</span>
                <input className={`outline-none bg-transparent w-40`} placeholder='Search' />
              </div>
              <button onClick={handleSwitchRole} className='flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow text-sm'>
                <span>Switch to Buyer</span>
                <span className='relative inline-flex w-8 h-4 rounded-full bg-blue-500/30'>
                  <span className='absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-blue-600'></span>
                </span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className='flex items-center space-x-1 mb-4 lg:mb-6 overflow-x-auto pb-2 mobile-nav-tabs scroll-smooth'>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'inquiries', label: 'Inquiries', icon: '📧' },
              { id: 'orders', label: 'Orders', icon: '🛒' },
              { id: 'analytics', label: 'Analytics', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap mobile-touch-target ${
                  activeTab === tab.id
                    ? isDarkMode ? 'bg-white/20 text-white shadow-md' : 'bg-blue-100 text-blue-700 shadow-md'
                    : isDarkMode ? 'text-white/70 hover:bg-white/10 hover:scale-105' : 'text-gray-600 hover:bg-gray-100 hover:scale-105'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium text-sm lg:text-base">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          {activeTab === 'dashboard' && (
            <div className='grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6'>
              {/* Main center column spans 2 */}
              <div className='xl:col-span-2 space-y-4 lg:space-y-6'>
                {/* KPI cards */}
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4'>
                  {[
                    { label: 'Total Products', value: dashboardStats.totalProducts, change: '+12%', icon: '📦' },
                    { label: 'Active Products', value: dashboardStats.activeProducts, change: '+8%', icon: '✅' },
                    { label: 'Total Orders', value: dashboardStats.totalOrders, change: '+15%', icon: '🛒' },
                    { label: 'Revenue', value: `₹${dashboardStats.totalRevenue.toLocaleString()}`, change: '+23%', icon: '💰' }
                  ].map((k) => (
                    <div key={k.label} className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-xl lg:rounded-2xl p-3 lg:p-4 shadow-sm mobile-card hover:shadow-md transition-all duration-200 hover:scale-105`}>
                      <div className='flex items-center justify-between mb-2'>
                        <div className='text-xs lg:text-sm opacity-70'>{k.label}</div>
                        <span className='text-lg lg:text-xl'>{k.icon}</span>
                      </div>
                      <div className='text-lg lg:text-2xl font-semibold'>{k.value}</div>
                      <div className={`text-xs mt-1 ${k.change.startsWith('-') ? 'text-red-500' : 'text-green-600'}`}>{k.change}</div>
                      <div className='mt-3 h-2 w-full rounded-md bg-gradient-to-r from-blue-100 to-transparent opacity-70'></div>
                    </div>
                  ))}
                </div>

                {/* Recent Products Preview */}
                <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm`}>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='font-semibold'>Recent Products</div>
                    <button 
                      onClick={() => navigate('/seller/my-products')}
                      className='text-sm text-blue-600 hover:text-blue-700'
                    >
                      View All →
                    </button>
                  </div>
                  <div className='space-y-3'>
                    {products.slice(0, 3).map((product) => (
                      <div key={product._id} className='flex items-center space-x-3 p-3 rounded-lg bg-gray-50/50'>
                        <div className='w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0'>
                          {product.images && product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} className='w-full h-full object-cover rounded-lg' />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center text-gray-400'>📦</div>
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='font-medium truncate'>{product.name}</p>
                          <p className='text-sm text-gray-500'>{product.category}</p>
                        </div>
                        <div className='text-right'>
                          <p className='font-semibold'>₹{product.price}</p>
                          <p className='text-xs text-gray-500'>Stock: {product.stock}</p>
                        </div>
                      </div>
                    ))}
                    {products.length === 0 && (
                      <div className='text-center py-8 text-gray-500'>
                        <div className='text-4xl mb-2'>📦</div>
                        <p>No products yet</p>
                        <button 
                          onClick={() => { window.location.href = `${import.meta.env.VITE_API_BASE_URL}/seller/add-product` }}
                          className='mt-2 text-blue-600 hover:text-blue-700 text-sm'
                        >
                          Create your first product
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm`}>
                  <div className='font-semibold mb-4'>Quick Actions</div>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    <button 
                      onClick={() => { window.location.href = `${import.meta.env.VITE_API_BASE_URL}/seller/add-product` }}
                      className='flex items-center justify-center space-x-2 p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors'
                    >
                      <span>➕</span>
                      <span className='text-sm font-medium'>Add Product</span>
                    </button>
                    <button 
                      onClick={() => navigate('/seller/my-orders')}
                      className='flex items-center justify-center space-x-2 p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors'
                    >
                      <span>📋</span>
                      <span className='text-sm font-medium'>View Orders</span>
                    </button>
                    <button 
                      onClick={() => handleTabChange('inquiries')}
                      className='flex items-center justify-center space-x-2 p-3 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors'
                    >
                      <span>📧</span>
                      <span className='text-sm font-medium'>View Inquiries</span>
                    </button>
                    <button 
                      onClick={() => handleTabChange('analytics')}
                      className='flex items-center justify-center space-x-2 p-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors'
                    >
                      <span>📊</span>
                      <span className='text-sm font-medium'>Analytics</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right sidebar panel */}
              <div className='space-y-4 lg:space-y-6'>
                <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm`}>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='relative cursor-pointer' onClick={() => navigate('/seller/profile')}>
                      <div
                        className='w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold border-2 border-blue-200'
                        style={{ backgroundColor: stringToColor(seller?.name || seller?.email || 'seller') }}
                        aria-label='seller avatar'
                      >
                        {getInitial(seller?.name || seller?.email)}
                      </div>
                      <div className='absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white'></div>
                    </div>
                    <div className='flex-1'>
                      <div className='font-semibold text-lg'>{seller?.name || 'Seller'}</div>
                      <div className='text-xs text-gray-500'>{seller?.email || 'No email'}</div>
                      {seller?.businessName && (
                        <div className='text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full mt-1 inline-block'>
                          {seller.businessName}
                        </div>
                      )}
                      {seller?.gstNumber && (
                        <div className='text-xs text-gray-500 mt-1'>GST: {seller.gstNumber}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className='grid grid-cols-2 gap-2 mb-4'>
                    <button onClick={() => navigate('/seller/profile')} className='text-xs bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors'>
                      Edit Profile
                    </button>
                    <button className='text-xs bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors'>
                      Settings
                    </button>
                  </div>
                  
                  <div className='space-y-3 text-sm'>
                    <div className='bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='font-medium text-gray-700'>Business Stats</span>
                        <span className='text-lg'>📊</span>
                      </div>
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <span className='text-gray-600'>Products:</span>
                          <span className='font-semibold text-blue-600'>{dashboardStats.totalProducts}</span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-gray-600'>Active:</span>
                          <span className='font-semibold text-green-600'>{dashboardStats.activeProducts}</span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-gray-600'>Orders:</span>
                          <span className='font-semibold text-purple-600'>{dashboardStats.totalOrders}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm`}>
                  <div className='font-semibold mb-2'>Seller Tips</div>
                  <div className='text-sm opacity-70 mb-3'>Boost your sales with these tips</div>
                  <div className='space-y-2 text-xs'>
                    <div className='flex items-center space-x-2'>
                      <span className='text-green-500'>✓</span>
                      <span>Add high-quality product images</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='text-green-500'>✓</span>
                      <span>Write detailed descriptions</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='text-green-500'>✓</span>
                      <span>Respond to customers quickly</span>
                    </div>
                  </div>
                </div>

                <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm`}>
                  <div className='font-semibold mb-3'>Recent Activity</div>
                  <div className='space-y-3 text-sm'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600'>📦</div>
                      <div className='flex-1'>
                        <div>Product created</div>
                        <div className='text-xs opacity-60'>2 hours ago</div>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600'>✅</div>
                      <div className='flex-1'>
                        <div>Order completed</div>
                        <div className='text-xs opacity-60'>5 hours ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className='space-y-6'>
              {showProductForm ? (
                <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-2xl p-6 shadow-sm`}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Add New Product</h2>
                    <button
                      onClick={() => setShowProductForm(false)}
                      className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                      ×
                    </button>
                  </div>
                  
                  <ProductCreationForm 
                    isDarkMode={isDarkMode}
                    onProductCreated={handleProductCreated}
                    onCancel={() => setShowProductForm(false)}
                  />
                </div>
              ) : (
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-xl font-bold'>Product Management</h2>
                  <button
                    onClick={() => setShowProductForm(true)}
                    className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2'
                  >
                    <span>➕</span>
                    <span>Add Product</span>
                  </button>
                </div>
              )}
              
              {!showProductForm && (
                <ProductList 
                  isDarkMode={isDarkMode}
                  onEditProduct={(product) => {
                    // Handle edit product
                    console.log('Edit product:', product)
                  }}
                />
              )}
            </div>
          )}

          {/* Inquiries Tab */}
          {activeTab === 'inquiries' && (
            <InquiryManagement />
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-2xl p-6 shadow-sm`}>
              <h2 className='text-xl font-bold mb-6'>Order Management</h2>
              <div className='text-center py-12'>
                <div className='text-6xl mb-4'>🛒</div>
                <h3 className='text-lg font-medium mb-2'>No orders yet</h3>
                <p className='text-gray-500'>Orders will appear here when customers purchase your products</p>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-2xl p-6 shadow-sm`}>
              <h2 className='text-xl font-bold mb-6'>Analytics & Reports</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                <div className='bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4'>
                  <div className='text-2xl mb-2'>📈</div>
                  <h3 className='font-semibold mb-1'>Sales Trend</h3>
                  <p className='text-sm text-gray-600'>Track your sales performance over time</p>
                </div>
                <div className='bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4'>
                  <div className='text-2xl mb-2'>👥</div>
                  <h3 className='font-semibold mb-1'>Customer Insights</h3>
                  <p className='text-sm text-gray-600'>Understand your customer behavior</p>
                </div>
                <div className='bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4'>
                  <div className='text-2xl mb-2'>📊</div>
                  <h3 className='font-semibold mb-1'>Product Performance</h3>
                  <p className='text-sm text-gray-600'>See which products perform best</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileNav 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isDarkMode={isDarkMode}
      />
    </div>
  )
}

export default Sellerdashboard
