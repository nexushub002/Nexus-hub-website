import React from 'react'

const MobileNav = ({ activeTab, onTabChange, isDarkMode }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'inquiries', label: 'Inquiries', icon: '📧' },
    { id: 'orders', label: 'Orders', icon: '🛒' },
    { id: 'analytics', label: 'Analytics', icon: '📈' }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 lg:hidden z-40">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default MobileNav
