import React, { useState, useEffect } from 'react'

// Enhanced features for the footer
export const useScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  return { isVisible }
}

// Newsletter subscription with validation
export const useNewsletterSubscription = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const [message, setMessage] = useState('')

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const subscribe = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setStatus('error')
      setMessage('Please enter your email address')
      return
    }

    if (!validateEmail(email)) {
      setStatus('error')
      setMessage('Please enter a valid email address')
      return
    }

    setStatus('loading')
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStatus('success')
      setMessage('Thank you for subscribing! 🎉')
      setEmail('')
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    } catch (error) {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return {
    email,
    setEmail,
    status,
    message,
    subscribe
  }
}

// Mobile-specific footer navigation
export const MobileFooterNav = ({ className = '' }) => {
  const quickLinks = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Categories', href: '/categories', icon: '📂' },
    { name: 'Deals', href: '/deals', icon: '🏷️' },
    { name: 'Account', href: '/account', icon: '👤' }
  ]

  return (
    <div className={`mobile-footer-nav ${className}`}>
      {quickLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          className="mobile-nav-item"
          aria-label={link.name}
        >
          <span className="mobile-nav-icon">{link.icon}</span>
          <span className="mobile-nav-text">{link.name}</span>
        </a>
      ))}
    </div>
  )
}

// Trust badges component
export const TrustBadges = () => {
  const badges = [
    { name: 'SSL Secure', icon: '🔒', description: 'Secure Shopping' },
    { name: 'Free Shipping', icon: '🚚', description: 'On Orders $50+' },
    { name: '24/7 Support', icon: '💬', description: 'Customer Service' },
    { name: 'Money Back', icon: '💰', description: '30-Day Guarantee' }
  ]

  return (
    <div className="trust-badges">
      {badges.map((badge) => (
        <div key={badge.name} className="trust-badge">
          <span className="trust-icon">{badge.icon}</span>
          <div className="trust-text">
            <div className="trust-title">{badge.name}</div>
            <div className="trust-desc">{badge.description}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default {
  useScrollToTop,
  useNewsletterSubscription,
  MobileFooterNav,
  TrustBadges
}
