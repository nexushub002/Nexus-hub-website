import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react'
import Homepage from './pages/Homepage'
import Sellersignup from './pages/Sellersignup';
import SellerSignin from './pages/SellerSignin';
import AddProduct from './pages/AddProduct';
import Sellerdashboard from './pages/Sellerdashboard';
import MyProducts from './pages/MyProducts';
import MyOrders from './pages/MyOrders';
import SellerProfile from './pages/SellerProfile';
import { SellerProvider, useSeller } from './context/SellerContext';
import './App.css'

// Protected Route Component with Enhanced Security
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, seller, checkAuthStatus } = useSeller();
  const [isVerifying, setIsVerifying] = useState(true);
  
  // Enhanced security check on route access
  useEffect(() => {
    const verifyAccess = async () => {
      // Block access immediately if no authentication
      if (!loading && !isAuthenticated) {
        console.log('🚫 Access denied: Not authenticated');
        window.location.replace('/seller-signin');
        return;
      }
      
      // Block access if no seller data
      if (!loading && isAuthenticated && !seller) {
        console.log('🚫 Access denied: No seller data');
        window.location.replace('/seller-signin');
        return;
      }
      
      if (isAuthenticated && seller) {
        // Verify session is still valid with backend
        try {
          const response = await fetch('http://localhost:3000/api/seller/auth/me', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            console.log('🚫 Access denied: Session invalid');
            window.location.replace('/seller-signin');
            return;
          }
          
          const data = await response.json();
          if (!data.user || !data.user.roles?.includes('seller')) {
            console.log('🚫 Access denied: Invalid seller role');
            window.location.replace('/seller-signin');
            return;
          }
          
        } catch (error) {
          console.error('🚫 Session verification failed:', error);
          window.location.replace('/seller-signin');
          return;
        }
      }
      
      setIsVerifying(false);
    };
    
    verifyAccess();
  }, [isAuthenticated, loading, seller, checkAuthStatus]);
  
  if (loading || isVerifying) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Verifying access...</div>
          <div className="text-sm text-gray-500 mt-2">Please wait while we secure your session</div>
        </div>
      </div>
    );
  }
  
  // Double check authentication before rendering
  if (!isAuthenticated || !seller) {
    return <Navigate to="/seller-signin" replace />;
  }
  
  return children;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSeller();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/seller/dashboard" replace /> : children;
};

// Global Route Guard Component
const GlobalRouteGuard = ({ children }) => {
  const { isAuthenticated, seller } = useSeller();
  
  useEffect(() => {
    // Block any seller route access without authentication
    const currentPath = window.location.pathname;
    const isSellerRoute = currentPath.startsWith('/seller/');
    
    if (isSellerRoute && (!isAuthenticated || !seller)) {
      console.log('🚫 Global Guard: Blocking unauthorized seller route access');
      window.location.replace('/seller-signin');
    }
  }, [isAuthenticated, seller]);
  
  return children;
};

function AppRoutes() {
  return (
    <GlobalRouteGuard>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/seller-signup" element={<PublicRoute><Sellersignup /></PublicRoute>} />
        <Route path="/seller-signin" element={<PublicRoute><SellerSignin /></PublicRoute>} />
        <Route path="/seller/dashboard" element={<ProtectedRoute><Sellerdashboard /></ProtectedRoute>} />
        <Route path="/seller/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
        <Route path="/seller/my-products" element={<ProtectedRoute><MyProducts /></ProtectedRoute>} />
        <Route path="/seller/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/seller/profile" element={<ProtectedRoute><SellerProfile /></ProtectedRoute>} />
        {/* Catch-all route for any unauthorized seller paths */}
        <Route path="/seller/*" element={<Navigate to="/seller-signin" replace />} />
      </Routes>
    </GlobalRouteGuard>
  );
}

function App() {
  return (
    <SellerProvider>
      <div> 
        <AppRoutes />
      </div>
    </SellerProvider>
  );
}

export default App;
