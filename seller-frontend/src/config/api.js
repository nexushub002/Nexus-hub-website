/**
 * API Configuration for Seller Frontend
 * Centralized API URL management with environment-aware fallbacks
 */

// Get API base URL with fallback logic
const getApiBaseUrl = () => {
  // Check environment variable first
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, ''); // Remove trailing slashes
  }

  // Fallback based on current environment
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    
    // Production - Vercel deployments
    // The backend should be set via VITE_API_BASE_URL in Vercel
    // This is a fallback if not configured
    if (hostname.includes('vercel.app') || hostname.includes('sellernexus')) {
      // Try to infer from common patterns or use a known backend URL
      return 'https://nexus-hub-backend.onrender.com'; // Update this to your actual backend URL
    }
  }

  // Default fallback for local development
  return 'http://localhost:3000';
};

// Export the API base URL
export const API_BASE_URL = getApiBaseUrl();

/**
 * Build a full API URL from a path
 * @param {string} path - The API path (e.g., '/api/products')
 * @returns {string} - Full API URL
 */
export function buildApiUrl(path) {
  const base = API_BASE_URL.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

/**
 * Get the buyer frontend URL
 * @returns {string} - Buyer frontend base URL
 */
export const getBuyerFrontendUrl = () => {
  const envUrl = (import.meta.env.VITE_FRONTED_URL || '').trim();
  if (envUrl) return envUrl.replace(/\/$/, '');
  
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:5173`;
    }
    if (hostname.includes('vercel.app')) {
      return 'https://nexus-hub-fronted.vercel.app';
    }
  }
  return 'https://nexus-hub-fronted.vercel.app';
};

export default {
  API_BASE_URL,
  buildApiUrl,
  getBuyerFrontendUrl,
};
