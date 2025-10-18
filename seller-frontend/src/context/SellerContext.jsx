import React, { createContext, useContext, useState, useEffect } from 'react';

const SellerContext = createContext();

// Cookie utility functions
const cookieUtils = {
  set: (name, value, days = 30) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${JSON.stringify(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  },
  
  get: (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        try {
          return JSON.parse(c.substring(nameEQ.length, c.length));
        } catch (e) {
          return c.substring(nameEQ.length, c.length);
        }
      }
    }
    return null;
  },
  
  remove: (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

// Activity tracking functions
const activityTracker = {
  track: (sellerId, activity) => {
    const timestamp = new Date().toISOString();
    const activityData = {
      ...activity,
      timestamp,
      sellerId,
      sessionId: cookieUtils.get('seller_session_id') || 'anonymous'
    };
    
    // Get existing activities
    const existingActivities = cookieUtils.get('seller_activities') || [];
    
    // Add new activity (keep last 100 activities)
    const updatedActivities = [activityData, ...existingActivities].slice(0, 100);
    
    // Store in cookies
    cookieUtils.set('seller_activities', updatedActivities, 30);
    
    // Also send to backend for persistent storage
    const url = `${import.meta.env.VITE_API_BASE_URL}/api/seller/activity/track`;

    fetch(url , {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(activityData),
    }).catch(err => console.warn('Activity tracking failed:', err));
  },
  
  getHistory: () => {
    return cookieUtils.get('seller_activities') || [];
  },
  
  clearHistory: () => {
    cookieUtils.remove('seller_activities');
  }
};

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
  const [sellerHistory, setSellerHistory] = useState([]);
  const [sessionData, setSessionData] = useState({});

  // Simple initialization - check cookies first
  useEffect(() => {
    const initAuth = () => {
      initializeSession();
      loadSellerHistory();
      
      // Check for existing seller info in cookies first
      const existingSellerInfo = cookieUtils.get('seller_info');
      if (existingSellerInfo && existingSellerInfo.id) {
        console.log('✅ Found seller in cookies - auto login');
        // Ensure both _id and id fields are available
        const sellerWithBothIds = {
          ...existingSellerInfo,
          _id: existingSellerInfo.id,
          id: existingSellerInfo.id
        };
        setSeller(sellerWithBothIds);
        setLoading(false);
      } else {
        console.log('❌ No seller cookies found');
        setSeller(null);
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // No periodic validation - keep it simple

  // Track page visits and user interactions
  useEffect(() => {
    if (seller) {
      trackActivity('page_visit', {
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    }
  }, [seller, window.location.pathname]);

  const initializeSession = () => {
    // Generate session ID if not exists
    let sessionId = cookieUtils.get('seller_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      cookieUtils.set('seller_session_id', sessionId, 1); // 1 day session
    }

    // Load session data
    const sessionInfo = cookieUtils.get('seller_session_data') || {};
    setSessionData({
      ...sessionInfo,
      sessionId,
      startTime: sessionInfo.startTime || new Date().toISOString(),
      lastActivity: new Date().toISOString()
    });
  };

  const loadSellerHistory = () => {
    const history = activityTracker.getHistory();
    setSellerHistory(history);
  };

  const checkAuthStatus = async (skipRedirect = false) => {
    try {
      // Simple cookie check first
      const existingSellerInfo = cookieUtils.get('seller_info');
      if (existingSellerInfo && existingSellerInfo.id) {
        setSeller(existingSellerInfo);
        setLoading(false);
        return;
      }

      // If no cookie, try API call

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/seller/auth/me`;

      const response = await fetch(url , {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.user && data.user.roles?.includes('seller')) {
          // Ensure both _id and id fields are available
          const sellerWithBothIds = {
            ...data.user,
            _id: data.user._id,
            id: data.user._id
          };
          setSeller(sellerWithBothIds);
          
          // Store seller info in cookies
          cookieUtils.set('seller_info', {
            id: data.user._id,
            _id: data.user._id,
            name: data.user.name,
            email: data.user.email,
            businessName: data.user.businessName,
            gstNumber: data.user.gstNumber,
            lastLogin: new Date().toISOString(),
            roles: data.user.roles
          }, 30);
        } else {
          setSeller(null);
          cookieUtils.remove('seller_info');
        }
      } else {
        setSeller(null);
        cookieUtils.remove('seller_info');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setSeller(null);
      cookieUtils.remove('seller_info');
    } finally {
      setLoading(false);
    }
  };

  const trackActivity = (action, data = {}) => {
    if (seller) {
      activityTracker.track(seller._id || seller.id, { action, ...data });
      loadSellerHistory(); // Refresh history
    }
  };

  const updateSessionData = (updates) => {
    const updatedSession = {
      ...sessionData,
      ...updates,
      lastActivity: new Date().toISOString()
    };
    setSessionData(updatedSession);
    cookieUtils.set('seller_session_data', updatedSession, 1);
  };

  const login = async (email, password) => {
    const loginAttempt = {
      timestamp: new Date().toISOString(),
      email,
      userAgent: navigator.userAgent,
      ip: 'client-side' // Will be captured on server
    };

    try {

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/seller/auth/seller-login`;

      const response = await fetch(url , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ 
          email, 
          password,
          sessionId: sessionData.sessionId,
          loginAttempt 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const user = data.user || { email, roles: ['seller'] };
        // Ensure both _id and id fields are available
        const sellerWithBothIds = {
          ...user,
          _id: user._id || user.id,
          id: user._id || user.id
        };
        setSeller(sellerWithBothIds);
        
        // Store comprehensive seller info
        cookieUtils.set('seller_info', {
          id: user._id || user.id,
          _id: user._id || user.id,
          name: user.name,
          email: user.email,
          businessName: user.businessName,
          gstNumber: user.gstNumber,
          lastLogin: new Date().toISOString(),
          loginCount: (cookieUtils.get('seller_info')?.loginCount || 0) + 1
        }, 30);

        // Track successful login
        activityTracker.track(user._id || user.id, {
          action: 'login',
          status: 'success',
          method: 'email_password',
          ...loginAttempt
        });

        // Update session
        updateSessionData({
          userId: user._id || user.id,
          loginTime: new Date().toISOString(),
          isAuthenticated: true
        });

        loadSellerHistory();
        return { success: true, data };
      } else {
        // Track failed login
        activityTracker.track('anonymous', {
          action: 'login',
          status: 'failed',
          reason: data.message,
          ...loginAttempt
        });

        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Track login error
      activityTracker.track('anonymous', {
        action: 'login',
        status: 'error',
        error: error.message,
        ...loginAttempt
      });

      return { success: false, message: 'Something went wrong. Please try again.' };
    }
  };

  const logout = async () => {
    const logoutData = {
      timestamp: new Date().toISOString(),
      sessionDuration: sessionData.startTime ? 
        new Date() - new Date(sessionData.startTime) : 0
    };

    try {
      // Track logout activity
      if (seller) {
        trackActivity('logout', {
          status: 'initiated',
          ...logoutData
        });
      }
       
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/seller/auth/seller-logout`;

      await fetch(url , {
        method: 'POST',
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          logoutData
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Track successful logout
      if (seller) {
        activityTracker.track(seller._id || seller.id, {
          action: 'logout',
          status: 'success',
          ...logoutData
        });
      }

    } catch (error) {
      console.error('Logout error:', error);
      
      // Track logout error
      if (seller) {
        trackActivity('logout', {
          status: 'error',
          error: error.message,
          ...logoutData
        });
      }
    } finally {
      // Clear seller state and session
      setSeller(null);
      cookieUtils.remove('seller_info');
      
      // Update session to logged out state
      updateSessionData({
        isAuthenticated: false,
        logoutTime: new Date().toISOString()
      });
    }
  };

  const register = async (userData) => {
    const registrationAttempt = {
      timestamp: new Date().toISOString(),
      email: userData.email,
      companyName: userData.companyName,
      userAgent: navigator.userAgent,
      sessionId: sessionData.sessionId
    };

    try {

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/seller/auth/seller-register`;

      const response = await fetch(url , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          ...userData,
          registrationAttempt
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const user = data.user;
        // Ensure both _id and id fields are available
        const sellerWithBothIds = {
          ...user,
          _id: user._id || user.id,
          id: user._id || user.id
        };
        setSeller(sellerWithBothIds);
        
        // Store new seller info
        cookieUtils.set('seller_info', {
          id: user._id || user.id,
          _id: user._id || user.id,
          name: user.name,
          email: user.email,
          businessName: user.businessName,
          gstNumber: user.gstNumber,
          registrationDate: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          loginCount: 1
        }, 30);

        // Track successful registration
        activityTracker.track(user._id || user.id, {
          action: 'register',
          status: 'success',
          accountType: 'seller',
          ...registrationAttempt
        });

        // Update session
        updateSessionData({
          userId: user._id || user.id,
          registrationTime: new Date().toISOString(),
          isAuthenticated: true
        });

        loadSellerHistory();
        return { success: true, data };
      } else {
        // Track failed registration
        activityTracker.track('anonymous', {
          action: 'register',
          status: 'failed',
          reason: data.message,
          ...registrationAttempt
        });

        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Track registration error
      activityTracker.track('anonymous', {
        action: 'register',
        status: 'error',
        error: error.message,
        ...registrationAttempt
      });

      return { success: false, message: 'Something went wrong. Please try again.' };
    }
  };

  // Additional tracking methods for business activities
  const trackBusinessActivity = (activity, data = {}) => {
    if (seller) {
      trackActivity(`business_${activity}`, {
        businessName: seller.businessName,
        ...data
      });
    }
  };

  const getSellerAnalytics = () => {
    const history = sellerHistory;
    const analytics = {
      totalActivities: history.length,
      loginCount: history.filter(h => h.action === 'login' && h.status === 'success').length,
      lastLogin: history.find(h => h.action === 'login' && h.status === 'success')?.timestamp,
      sessionDuration: sessionData.startTime ? 
        new Date() - new Date(sessionData.startTime) : 0,
      mostActiveHour: getMostActiveHour(history),
      activityByType: getActivityByType(history),
      recentActivities: history.slice(0, 10)
    };
    return analytics;
  };

  const getMostActiveHour = (history) => {
    const hourCounts = {};
    history.forEach(activity => {
      const hour = new Date(activity.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    return Object.keys(hourCounts).reduce((a, b) => 
      hourCounts[a] > hourCounts[b] ? a : b, 0);
  };

  const getActivityByType = (history) => {
    const typeCounts = {};
    history.forEach(activity => {
      typeCounts[activity.action] = (typeCounts[activity.action] || 0) + 1;
    });
    return typeCounts;
  };

  const clearSellerHistory = () => {
    activityTracker.clearHistory();
    setSellerHistory([]);
    cookieUtils.remove('seller_activities');
  };

  const exportSellerData = () => {
    const sellerInfo = cookieUtils.get('seller_info');
    const activities = sellerHistory;
    const session = sessionData;
    
    return {
      sellerInfo,
      activities,
      session,
      analytics: getSellerAnalytics(),
      exportDate: new Date().toISOString()
    };
  };

  const value = {
    // Core authentication
    seller,
    loading,
    login,
    logout,
    register,
    checkAuthStatus,
    isAuthenticated: !!seller,
    
    // Session and tracking
    sessionData,
    sellerHistory,
    trackActivity,
    trackBusinessActivity,
    updateSessionData,
    
    // Analytics and data
    getSellerAnalytics,
    clearSellerHistory,
    exportSellerData,
    
    // Utility functions
    cookieUtils,
    activityTracker
  };

  return (
    <SellerContext.Provider value={value}>
      {children}
    </SellerContext.Provider>
  );
};
