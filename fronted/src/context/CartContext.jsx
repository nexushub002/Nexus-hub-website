import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserContext } from './UserContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useContext(UserContext);

  // API base URL
  const API_BASE = 'http://localhost:3000/api/cart';

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json'
    };
  };

  // Load cart from server when component mounts
  useEffect(() => {
    fetchCart();
  }, [user]);

  // Fetch cart from server
  const fetchCart = async () => {
    setLoading(true);
    try {
      const userId = user?._id || "60f7b3b3b3b3b3b3b3b3b3b3"; // Default test user ID
      const response = await fetch(`${API_BASE}?userId=${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (data.success) {
        setCartItems(data.cart || []);
      } else {
        console.error('Failed to fetch cart:', data.message);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    setLoading(true);
    try {
      console.log('Adding to cart:', product._id, 'quantity:', quantity);
      
      const response = await fetch(`${API_BASE}/add`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          productId: product._id,
          userId: user?._id || "60f7b3b3b3b3b3b3b3b3b3b3",
          quantity
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
        // Check if item already exists in local state
        const existingItemIndex = cartItems.findIndex(item => item._id === product._id);
        
        if (existingItemIndex >= 0) {
          // Update existing item quantity
          const updatedItems = [...cartItems];
          updatedItems[existingItemIndex].quantity += quantity;
          setCartItems(updatedItems);
        } else {
          // Add new item to local state
          const cartItem = {
            _id: product._id,
            name: product.name,
            price: product.price,
            priceRange: product.priceRange,
            images: product.images,
            category: product.category,
            subcategory: product.subcategory,
            moq: product.moq,
            quantity: quantity,
            addedAt: new Date().toISOString()
          };
          setCartItems(prev => [...prev, cartItem]);
        }
        
        // Open cart panel to show the added item
        setIsCartOpen(true);
      }
      
      return data;
    } catch (error) {
      console.error('Network error adding to cart:', error);
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    setLoading(true);
    try {
      const userId = user?._id || "60f7b3b3b3b3b3b3b3b3b3b3";
      const response = await fetch(`${API_BASE}/update/${productId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity: newQuantity, userId })
      });

      const data = await response.json();
      
      if (data.success) {
        if (newQuantity === 0) {
          // Remove item from local state
          setCartItems(prev => prev.filter(item => item._id !== productId));
        } else {
          // Update quantity in local state
          setCartItems(prev => prev.map(item => 
            item._id === productId ? { ...item, quantity: newQuantity } : item
          ));
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      const userId = user?._id || "60f7b3b3b3b3b3b3b3b3b3b3";
      const response = await fetch(`${API_BASE}/remove/${productId}?userId=${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove from local state
        setCartItems(prev => prev.filter(item => item._id !== productId));
      }
      
      return data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      const userId = user?._id || "60f7b3b3b3b3b3b3b3b3b3b3";
      const response = await fetch(`${API_BASE}/clear?userId=${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (data.success) {
        setCartItems([]);
      }
      
      return data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || (item.priceRange ? item.priceRange.min : 0);
      return total + (price * item.quantity);
    }, 0);
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item._id === productId);
  };

  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item._id === productId);
    return item ? item.quantity : 0;
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const openCart = () => {
    setIsCartOpen(true);
  };

  const value = {
    cartItems,
    loading,
    isCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartCount,
    getCartTotal,
    isInCart,
    getItemQuantity,
    toggleCart,
    closeCart,
    openCart,
    fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
