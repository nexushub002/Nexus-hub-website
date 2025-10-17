import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserContext } from './UserContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);

  // API base URL
  const API_BASE = 'http://localhost:3000/api/wishlist';

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json'
    };
  };

  // Load wishlist from server when component mounts
  useEffect(() => {
    fetchWishlist();
  }, [user]);

  // Fetch wishlist from server
  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const userId = user?._id || "60f7b3b3b3b3b3b3b3b3b3b3"; // Default test user ID

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/wishlist?userId=${userId}`;

      const response = await fetch(url , {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (data.success) {
        setWishlistItems(data.wishlist || []);
      } else {
        console.error('Failed to fetch wishlist:', data.message);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product) => {
    setLoading(true);
    try {
      console.log('Adding to wishlist:', product._id);
      console.log('User:', user);
      
      const response = await fetch(`${API_BASE}/add`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          productId: product._id,
          userId: user?._id || "60f7b3b3b3b3b3b3b3b3b3b3" // Default test user ID
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        return { success: false, message: `Server error: ${response.status}` };
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        // Add to local state
        const wishlistItem = {
          _id: product._id,
          name: product.name,
          price: product.price,
          priceRange: product.priceRange,
          images: product.images,
          category: product.category,
          subcategory: product.subcategory,
          moq: product.moq,
          addedAt: new Date().toISOString()
        };
        setWishlistItems(prev => [...prev, wishlistItem]);
      }
      
      return data;
    } catch (error) {
      console.error('Network error adding to wishlist:', error);
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    setLoading(true);
    try {
      const userId = user?._id || "60f7b3b3b3b3b3b3b3b3b3b3"; // Default test user ID

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/wishlist/remove/${productId}?userId=${userId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove from local state
        setWishlistItems(prev => prev.filter(item => item._id !== productId));
      }
      
      return data;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item._id === productId);
  };

  const clearWishlist = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/clear`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (data.success) {
        setWishlistItems([]);
      }
      
      return data;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;
