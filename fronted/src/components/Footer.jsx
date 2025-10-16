import React from 'react'
import { useNewsletterSubscription, useScrollToTop, TrustBadges } from './FooterEnhancements'
import './Footer.css'

const Footer = () => {
  const { email, setEmail, status, message, subscribe } = useNewsletterSubscription()
  const { isVisible } = useScrollToTop()

  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer-container">
      {/* Newsletter Section */}
      <div className="newsletter-section">
        <div className="newsletter-content">
          <div className="newsletter-text">
            <h3>Stay Updated with Nexus Hub</h3>
            <p>Get the latest deals, new arrivals, and exclusive offers delivered to your inbox</p>
          </div>
          <form onSubmit={subscribe} className="newsletter-form">
            <div className="input-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="newsletter-input"
                disabled={status === 'loading'}
                required
              />
              <button 
                type="submit" 
                className={`newsletter-btn ${status}`}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <span className="loading-spinner">⏳</span>
                ) : status === 'success' ? (
                  <span className="success-icon">✓</span>
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>
            {message && (
              <p className={`newsletter-message ${status}`}>{message}</p>
            )}
          </form>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-grid">
          {/* Company Info */}
          <div className="footer-section company-info">
            <div className="logo-section">
              <h2 className="footer-logo">Nexus Hub</h2>
              <p className="company-tagline">Your Gateway to Everything</p>
            </div>
            <p className="company-description">
              Discover amazing products from trusted sellers worldwide. 
              Quality, convenience, and exceptional service - all in one place.
            </p>
            <div className="social-links">
              <a href="#" className="social-link facebook" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="social-link twitter" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="social-link instagram" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323C6.001 8.198 7.152 7.708 8.449 7.708s2.448.49 3.323 1.416c.875.926 1.365 2.077 1.365 3.374s-.49 2.448-1.365 3.323c-.875.807-2.026 1.167-3.323 1.167zm7.718 0c-1.297 0-2.448-.49-3.323-1.297-.875-.926-1.365-2.077-1.365-3.374s.49-2.448 1.365-3.323c.875-.926 2.026-1.416 3.323-1.416s2.448.49 3.323 1.416c.875.926 1.365 2.077 1.365 3.374s-.49 2.448-1.365 3.323c-.875.807-2.026 1.167-3.323 1.167z"/>
                </svg>
              </a>
              <a href="#" className="social-link linkedin" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/products">All Products</a></li>
              <li><a href="/categories">Categories</a></li>
              <li><a href="/deals">Today's Deals</a></li>
              <li><a href="/new-arrivals">New Arrivals</a></li>
              <li><a href="/bestsellers">Best Sellers</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="footer-section">
            <h4 className="footer-title">Customer Service</h4>
            <ul className="footer-links">
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/help">Help Center</a></li>
              <li><a href="/shipping">Shipping Info</a></li>
              <li><a href="/returns">Returns & Exchanges</a></li>
              <li><a href="/track-order">Track Your Order</a></li>
              <li><a href="/size-guide">Size Guide</a></li>
            </ul>
          </div>

          {/* For Sellers */}
          <div className="footer-section">
            <h4 className="footer-title">For Sellers</h4>
            <ul className="footer-links">
              <li><a href="/seller/register">Become a Seller</a></li>
              <li><a href="/seller/dashboard">Seller Dashboard</a></li>
              <li><a href="/seller/help">Seller Help</a></li>
              <li><a href="/seller/policies">Seller Policies</a></li>
              <li><a href="/advertise">Advertise with Us</a></li>
              <li><a href="/bulk-orders">Bulk Orders</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section contact-info">
            <h4 className="footer-title">Get in Touch</h4>
            <div className="contact-item">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <div>
                <p>123 Commerce Street</p>
                <p>Business District, City 12345</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </div>
              <div>
                <p>+1 (555) 123-4567</p>
                <p>Mon-Fri: 9AM-6PM</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <div>
                <p>support@nexushub.com</p>
                <p>24/7 Support Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges Section */}
      <div className="trust-section">
        <TrustBadges />
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="copyright">
            <p>&copy; {currentYear} Nexus Hub. All rights reserved.</p>
          </div>
          <div className="footer-bottom-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/cookies">Cookie Policy</a>
            <a href="/accessibility">Accessibility</a>
          </div>
          <div className="payment-methods">
            <span className="payment-text">We Accept:</span>
            <div className="payment-icons">
              <div className="payment-icon visa">VISA</div>
              <div className="payment-icon mastercard">MC</div>
              <div className="payment-icon paypal">PP</div>
              <div className="payment-icon amex">AMEX</div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {isVisible && (
        <button 
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
          </svg>
        </button>
      )}
    </footer>
  )
}

export default Footer
