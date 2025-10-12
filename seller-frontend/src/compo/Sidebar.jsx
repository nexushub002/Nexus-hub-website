import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSeller } from '../context/SellerContext'

const Sidebar = ({ isDarkMode, onToggleTheme, onSwitchRole }) => {
  const [active, setActive] = useState('Dashboard (Overview)')
  const { seller } = useSeller()
  const navigate = useNavigate()
  const location = useLocation()
  
  const menuItems = [
    { label: 'Dashboard (Overview)', path: '/seller/dashboard' },
    { label: 'Add Product', path: '/seller/add-product' },
    { label: 'My Products', path: '/seller/my-products' },
    { label: 'Orders', path: '/seller/my-orders' },
    { label: 'Manufacturer Profile', path: '/seller/manufacturer-profile' }
  ]

  // Update active state based on current route
  useEffect(() => {
    const currentItem = menuItems.find(item => item.path === location.pathname)
    if (currentItem) {
      setActive(currentItem.label)
    }
  }, [location.pathname])

  const handleMenuClick = (item) => {
    setActive(item.label)
    navigate(item.path)
  }

  // helpers for letter avatar
  const getInitial = (str) => {
    const s = (str || '').trim()
    return s ? s.charAt(0).toUpperCase() : 'S'
  }
  const stringToColor = (str = 'seller') => {
    let hash = 0
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
    const h = Math.abs(hash) % 360
    return `hsl(${h}, 70%, 40%)`
  }

  const displayName = seller?.name || seller?.email || 'Seller'
  const initial = getInitial(displayName)
  const bgColor = stringToColor(displayName)

  return (
    <div className={`h-screen sticky top-0 w-64 px-4 py-6 ${isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-white text-[#0f172a]'} border-r`}> 
      <div className="flex items-center gap-2 px-2 mb-6">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
          style={{ backgroundColor: bgColor }}
          aria-label="seller avatar"
        >
          {initial}
        </div>
        <div className="font-semibold truncate" title={displayName}>{displayName}</div>
      </div>

      <div className="text-sm font-semibold mb-2 px-2">Menu</div>
      <nav className="space-y-1">
        {menuItems.map(item => {
          const isActive = active === item.label
          return (
            <div
              key={item.label}
              onClick={() => handleMenuClick(item)}
              className={`px-3 py-2 rounded-lg cursor-pointer transition ${
                isActive
                  ? 'bg-[#1f4e95] text-white'
                  : isDarkMode
                  ? 'hover:bg-white/10'
                  : 'hover:bg-gray-100'
              }`}
            >
              {item.label}
            </div>
          )
        })}
      </nav>

      {/* <div className="mt-6 px-2">
        <div className="text-sm font-semibold mb-2">Appearance</div>
        <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
          <span className="text-sm">{isDarkMode ? 'Dark' : 'Light'}</span>
          <button onClick={onToggleTheme} className={`w-12 h-6 rounded-full relative transition ${isDarkMode ? 'bg-blue-500' : 'bg-gray-300'}`}>
            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition ${isDarkMode ? 'translate-x-6' : ''}`}></span>
          </button>
        </div>
      </div> */}

      <div className="mt-6 px-2">
        <div className="text-sm font-semibold mb-2">Switch Role</div>
        <button onClick={onSwitchRole} className="w-full text-center px-3 py-2 rounded-lg bg-blue-600 text-white hover:opacity-90">Switch to Buyer</button>
      </div>
    </div>
  )
}

export default Sidebar


