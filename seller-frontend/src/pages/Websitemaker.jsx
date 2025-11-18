import React, { useEffect, useMemo, useState } from 'react'
import Sidebar from '../compo/Sidebar'
import { useSeller } from '../context/SellerContext'

const WEBSITE_FEATURES = [
  'Tell your brand story with banners & highlights',
  'Pin your top-performing products',
  'Share a single public link with buyers'
]

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim()
const API_BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl

const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  if (!API_BASE_URL) {
    return normalizedPath
  }
  if (API_BASE_URL.endsWith('/api') && normalizedPath.startsWith('/api/')) {
    return `${API_BASE_URL}${normalizedPath.slice(4)}`
  }
  return `${API_BASE_URL}${normalizedPath}`
}

const parseJsonResponse = async (response) => {
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }
  const text = await response.text()
  throw new Error(text || 'Server returned an unexpected response.')
}

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options)
  let data
  try {
    data = await parseJsonResponse(response)
  } catch (error) {
    const statusInfo = `${response.status} ${response.statusText}`.trim()
    const snippet = (error.message || '').slice(0, 200)
    throw new Error(`Server response error (${statusInfo}). ${snippet}`)
  }
  return { response, data }
}

const Websitemaker = () => {
  const { seller, isAuthenticated, loading } = useSeller()
  const [manufacturerData, setManufacturerData] = useState(null)
  const [message, setMessage] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [uploadingBanners, setUploadingBanners] = useState(false)
  const [savingBanners, setSavingBanners] = useState(false)
  const PUBLIC_SHOP_BASE_URL = import.meta.env.VITE_PUBLIC_SHOP_BASE_URL || 'https://nexus-hub-fronted.vercel.app'

  useEffect(() => {
    if (isAuthenticated && seller) {
      fetchManufacturerProfile()
    }
  }, [isAuthenticated, seller])

  const fetchManufacturerProfile = async () => {
    try {
      setMessage('')
      const url = buildApiUrl('/api/seller-profile/profile')
      const { response, data } = await fetchJson(url, { credentials: 'include' })

      if (response.ok && data.success) {
        setManufacturerData(data.seller)
      } else {
        setMessage(data.message || 'Unable to load your manufacturer profile right now.')
      }
    } catch (error) {
      console.error('Error fetching manufacturer profile:', error)
      setMessage('Unable to load your manufacturer profile right now.')
    }
  }

  const handleToggleTheme = () => setIsDarkMode((v) => !v)

  const handleSwitchRole = () => {
    window.location.href = '/'
  }

  const saveWebsiteBanners = async (banners) => {
    try {
      setSavingBanners(true)
      const url = buildApiUrl('/api/seller-profile/website-banners')

      const { response, data } = await fetchJson(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ banners })
      })
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error updating website banners')
      }

      setManufacturerData((prev) =>
        prev ? { ...prev, websiteBanners: data.banners } : { websiteBanners: data.banners }
      )
      setMessage('Website banners updated successfully')
    } catch (error) {
      console.error('Error saving website banners:', error)
      setMessage(error.message || 'Error saving website banners')
      throw error
    } finally {
      setSavingBanners(false)
    }
  }

  const uploadWebsiteBanners = async (files) => {
    if (!files || files.length === 0) return

    const filesArray = Array.from(files)
    const existingCount = manufacturerData?.websiteBanners?.length || 0

    if (existingCount + filesArray.length > 4) {
      setMessage('You can upload a maximum of 4 website banners.')
      return
    }

    setUploadingBanners(true)
    try {
      const formData = new FormData()
      filesArray.forEach((file) => formData.append('images', file))

      const uploadUrl = buildApiUrl('/api/upload/images')
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      const uploadData = await parseJsonResponse(uploadResponse)
      if (!uploadResponse.ok || !uploadData.success) {
        throw new Error(uploadData.message || 'Error uploading banner images')
      }

      const newBanners = uploadData.images.map((url, index) => {
        const file = filesArray[index]
        return {
          url,
          originalName: file?.name || 'website-banner',
          format: file?.type?.split('/')?.pop() || 'image'
        }
      })

      const combinedBanners = [
        ...(manufacturerData?.websiteBanners || []),
        ...newBanners
      ].slice(0, 4)

      await saveWebsiteBanners(combinedBanners)
      setMessage('Website banners uploaded successfully')
    } catch (error) {
      console.error('Error uploading website banners:', error)
      if (!error.message?.includes('updated successfully')) {
        setMessage(error.message || 'Error uploading website banners')
      }
    } finally {
      setUploadingBanners(false)
    }
  }

  const removeWebsiteBanner = async (identifier) => {
    try {
      const remainingBanners = (manufacturerData?.websiteBanners || []).filter((banner) => {
        if (banner._id) {
          return banner._id !== identifier
        }
        return banner.url !== identifier
      })
      await saveWebsiteBanners(remainingBanners)
    } catch (error) {
      console.error('Error removing website banner:', error)
    }
  }

  const shopLink = useMemo(() => {
    const shopName = manufacturerData?.shopName
    const sellerId = manufacturerData?.sellerId
    if (!shopName || !sellerId) return ''
    const segment = shopName.trim().replace(/[^A-Za-z0-9]/g, '')
    return segment ? `${PUBLIC_SHOP_BASE_URL}/${segment}/${sellerId}` : ''
  }, [manufacturerData?.shopName, manufacturerData?.sellerId, PUBLIC_SHOP_BASE_URL])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading website maker...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Please log in to customize your storefront.</div>
      </div>
    )
  }

  return (
    <div className={`${isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-[#f5f7fb] text-[#0f172a]'} min-h-screen`}>
      <div className="w-full lg:flex">
        <Sidebar
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          onSwitchRole={handleSwitchRole}
        />

        <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/70 dark:bg-white/10 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Website Maker</p>
              <h1 className="text-2xl sm:text-3xl font-semibold leading-snug">Launch your Nexus Hub storefront</h1>
              <p className="text-sm text-gray-500">
                Upload up to four hero banners, highlight your products, and share one beautiful link with buyers.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:items-center sm:justify-end">
              <button
                onClick={() => shopLink && window.open(shopLink, '_blank', 'noopener,noreferrer')}
                disabled={!shopLink}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg border text-sm text-center ${
                  shopLink
                    ? 'border-blue-600 text-blue-600 hover:bg-blue-50'
                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Preview Website
              </button>
              <button
                onClick={fetchManufacturerProfile}
                className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Refresh
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.toLowerCase().includes('success')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {message}
            </div>
          )}

          <div className={`${isDarkMode ? 'bg-white/5' : 'bg-white'} rounded-2xl p-4 sm:p-6 shadow-sm space-y-6`}>
            <div className="grid gap-3 sm:grid-cols-3">
              {WEBSITE_FEATURES.map((feature) => (
                <div
                  key={feature}
                  className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
                    isDarkMode ? 'bg-white/5 text-white/80' : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="border rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Website Banners</h2>
                  <p className="text-sm text-gray-500">Recommended size 1200 × 600px • Max 4 banners</p>
                </div>
                <div className="text-sm text-gray-500">
                  {manufacturerData?.websiteBanners?.length || 0}/4 used
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {manufacturerData?.websiteBanners?.map((banner) => (
                  <div
                    key={banner._id || banner.url}
                    className="relative group rounded-xl overflow-hidden border bg-gray-50"
                  >
                    <img src={banner.url} alt="Website banner" className="w-full h-32 object-cover" />
                    <button
                      onClick={() => removeWebsiteBanner(banner._id || banner.url)}
                      className="absolute top-2 right-2 bg-white/90 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      aria-label="Remove banner"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <label
                  htmlFor="banner-upload"
                  className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center h-32 cursor-pointer transition ${
                    (manufacturerData?.websiteBanners?.length || 0) >= 4 || uploadingBanners
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:border-blue-400 hover:bg-blue-50/40'
                  }`}
                >
                  <input
                    type="file"
                    id="banner-upload"
                    className="hidden"
                    accept="image/*"
                    multiple
                    disabled={(manufacturerData?.websiteBanners?.length || 0) >= 4 || uploadingBanners}
                    onChange={(e) => {
                      if (e.target.files.length > 0) {
                        uploadWebsiteBanners(e.target.files)
                        e.target.value = ''
                      }
                    }}
                  />
                  <span className="text-3xl">📁</span>
                  <span className="text-sm text-gray-600 text-center px-4">
                    {uploadingBanners
                      ? 'Uploading...'
                      : (manufacturerData?.websiteBanners?.length || 0) >= 4
                        ? 'Max banners uploaded'
                        : 'Upload website banners'}
                  </span>
                </label>
              </div>

              {savingBanners && (
                <p className="text-xs text-blue-600">Saving banners...</p>
              )}
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-white/5' : 'bg-white'} rounded-2xl p-6 shadow-sm`}>
            <h2 className="text-lg font-semibold mb-2">Need inspiration?</h2>
            <p className="text-sm text-gray-500 mb-4">
              Showcase your manufacturing capabilities, highlight hero products, or promote seasonal offers. Update banners anytime to keep buyers engaged.
            </p>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>Keep text minimal and readable.</li>
              <li>Use high-resolution images (JPG/PNG/WebP).</li>
              <li>Refresh banners for festivals or new launches.</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Websitemaker