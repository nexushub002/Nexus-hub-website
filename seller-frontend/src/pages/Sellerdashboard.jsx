import React, { useState } from 'react'
import Sidebar from '../compo/Sidebar'

const Sellerdashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const handleToggleTheme = () => setIsDarkMode((v) => !v)

  const handleSwitchRole = () => {
    // Navigate to buyer app dev server
    window.location.href = 'http://localhost:5173/'
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
            <div className='text-2xl font-semibold'>Dashboard</div>
            <div className='flex items-center gap-3'>
              <div className={`hidden md:block ${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-xl px-3 py-2`}>🔔</div>
              <div className={`hidden md:flex items-center gap-2 ${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-xl px-3 py-2`}>
                <span className='opacity-70'>Search</span>
                <input className={`outline-none bg-transparent w-40`} placeholder='Search' />
              </div>
              <button onClick={handleSwitchRole} className='hidden md:flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow text-sm'>
                <span>Switch to Buyer</span>
                <span className='relative inline-flex w-8 h-4 rounded-full bg-blue-500/30'>
                  <span className='absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-blue-600'></span>
                </span>
              </button>
            </div>
          </div>

          {/* Content grid: main + right panel */}
          <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
            {/* Main center column spans 2 */}
            <div className='xl:col-span-2'>
              {/* KPI cards */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                {[
                  { label: 'Avg. Selling Price', value: '$ 121.10', change: '+9.82%' },
                  { label: 'Avg. Clicks', value: '1912', change: '-51.71%' },
                  { label: 'Avg. Impressions', value: '120,192', change: '-43.71%' }
                ].map((k) => (
                  <div key={k.label} className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-2xl p-4 shadow-sm`}>
                    <div className='text-sm opacity-70 mb-2'>{k.label}</div>
                    <div className='text-2xl font-semibold'>{k.value}</div>
                    <div className={`text-xs mt-1 ${k.change.startsWith('-') ? 'text-red-500' : 'text-green-600'}`}>{k.change}</div>
                    <div className='mt-3 h-10 w-full rounded-md bg-gradient-to-r from-blue-100 to-transparent opacity-70'></div>
                  </div>
                ))}
              </div>

              {/* Overview Order */}
              <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-2xl p-5 shadow-sm mb-6`}>
                <div className='flex items-center justify-between mb-4'>
                  <div className='font-semibold'>Overview Order</div>
                  <div className='text-sm opacity-70'>Monthly ▾</div>
                </div>
                {/* simple bar chart mock */}
                <div className='grid grid-cols-12 gap-2 h-56 items-end'>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className='flex flex-col items-center gap-1'>
                      <div className='w-3 rounded bg-blue-500' style={{ height: `${30 + ((i * 13) % 70)}%` }}></div>
                      <div className='w-3 rounded bg-gray-300/70' style={{ height: `${10 + ((i * 7) % 40)}%` }}></div>
                      <div className='text-[10px] opacity-60 mt-1'>
                        {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orders table */}
              <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-2xl p-5 shadow-sm`}>
                <div className='flex items-center justify-between mb-3'>
                  <div className='font-semibold'>Orders</div>
                  <div className='text-sm opacity-70'>Sort ▾</div>
                </div>
                <div className='overflow-auto'>
                  <table className='w-full text-sm'>
                    <thead className={`${isDarkMode ? 'text-white/70' : 'text-gray-500'}`}>
                      <tr>
                        <th className='text-left py-2'>No</th>
                        <th className='text-left py-2'>Services name</th>
                        <th className='text-left py-2'>Status</th>
                        <th className='text-left py-2'>Date</th>
                        <th className='text-left py-2'>Buyer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1,2,3].map((n) => (
                        <tr key={n} className={`${isDarkMode ? 'border-white/10' : 'border-gray-200'} border-t`}> 
                          <td className='py-3'>{n}</td>
                          <td className='py-3'>I will design website UI UX in figma and landing page UI...</td>
                          <td className='py-3'><span className='bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs'>Ongoing</span></td>
                          <td className='py-3'>March 9, 2023</td>
                          <td className='py-3'>Leslie...</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right sidebar panel */}
            <div className='space-y-6'>
              <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-2xl p-5 shadow-sm`}>
                <div className='flex items-center gap-3 mb-3'>
                  <img src={`https://i.pravatar.cc/80`} alt='avatar' className='w-16 h-16 rounded-full object-cover' />
                  <div>
                    <div className='font-semibold'>Dhira Danuarta</div>
                    <div className='text-xs opacity-60'>Indonesia 🇮🇩</div>
                  </div>
                </div>
                <button className='text-xs bg-blue-600 text-white px-3 py-1 rounded-md mb-4'>Edit Profile</button>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center justify-between'><span className='opacity-70'>Response rate:</span><span>100%</span></div>
                  <div className='flex items-center justify-between'><span className='opacity-70'>Delivery on time:</span><span>39%</span></div>
                  <div className='flex items-center justify-between'><span className='opacity-70'>Order completed:</span><span>89%</span></div>
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-2xl p-5 shadow-sm`}>
                <div className='font-semibold mb-2'>Improve your service!</div>
                <div className='text-sm opacity-70'>Improve your service by reading article by top seller</div>
                <div className='mt-3 h-24 rounded-lg bg-gradient-to-r from-blue-100 to-transparent opacity-70'></div>
              </div>

              <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white'} rounded-2xl p-5 shadow-sm`}>
                <div className='font-semibold mb-3'>Top articles today</div>
                <div className='space-y-3 text-sm'>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 rounded-lg bg-gray-200'></div>
                    <div>How to close more orders in less time</div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 rounded-lg bg-gray-200'></div>
                    <div>5 tips to improve delivery on time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Sellerdashboard
