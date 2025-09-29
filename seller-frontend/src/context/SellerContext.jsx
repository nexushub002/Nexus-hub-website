import React, { createContext, useContext, useState, useEffect } from 'react';

const SellerContext = createContext();

export const useSeller = () => {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error('useSeller must be used within a SellerProvider');
  }
  return context;
};

export const SellerProvider = ({ children }) => {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if seller is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/seller/auth/me', {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSeller(data.user);
      } else {
        setSeller(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setSeller(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3000/api/seller/auth/seller-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSeller(data.user || { email, roles: ['seller'] });
        return { success: true, data };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Something went wrong. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:3000/api/seller/auth/seller-logout', {
        method: 'POST',
        credentials: 'include', // Include cookies
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setSeller(null);
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:3000/api/seller/auth/seller-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setSeller(data.user);
        return { success: true, data };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Something went wrong. Please try again.' };
    }
  };

  const value = {
    seller,
    loading,
    login,
    logout,
    register,
    checkAuthStatus,
    isAuthenticated: !!seller,
  };

  return (
    <SellerContext.Provider value={value}>
      {children}
    </SellerContext.Provider>
  );
};
