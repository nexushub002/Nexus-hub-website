import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react'
import Homepage from './pages/Homepage'
import Sellersignup from './pages/Sellersignup';
import SellerSignin from './pages/SellerSignin';
import AddProduct from './pages/AddProduct';
import Sellerdashboard from './pages/Sellerdashboard';
import MyProducts from './pages/MyProducts';
import EditProduct from './pages/EditProduct';
import MyOrders from './pages/MyOrders';
import SellerProfile from './pages/SellerProfile';
import ManufacturerProfile from './pages/ManufacturerProfile';
import Sellershoppage from './pages/Sellershoppage';
import ShopSectionPage from './pages/ShopSectionPage';
import Websitemaker from './pages/Websitemaker';
import CompanyProfile from './pages/CompanyProfile';
import { SellerProvider, useSeller } from './context/SellerContext';
import './App.css'

// Simple Protected Route - Only checks cookies
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSeller();
  
  // Show loading only briefly
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-sm text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }
  
  // Simple check - if no authentication, redirect to signin
  if (!isAuthenticated) {
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
        <Route path="/seller/my-products/:productId/edit" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
        <Route path="/seller/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/seller/profile" element={<ProtectedRoute><SellerProfile /></ProtectedRoute>} />
        <Route path="/company-profile/:sellerId" element={<CompanyProfile />} />
        <Route path="/:shopName/:sellerId" element={<Sellershoppage />} />
        <Route path="/shop-section" element={<ShopSectionPage />} />
        <Route path="/seller/manufacturer-profile" element={<ProtectedRoute><ManufacturerProfile /></ProtectedRoute>} />
        <Route path="/seller/website-maker" element={<ProtectedRoute><Websitemaker /></ProtectedRoute>} />
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
