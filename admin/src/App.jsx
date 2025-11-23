import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UsersManagement from './pages/UsersManagement';
import ProductsManagement from './pages/ProductsManagement';
import SellersManagement from './pages/SellersManagement';
import SellerProfileView from './pages/SellerProfileView';

import './App.css';

// Protected Route Component - Always checks authentication on every route access
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, checkAuth } = useAdmin();
  const location = useLocation();
  
  // Force re-check authentication every time this component renders (route change)
  useEffect(() => {
    // Always verify authentication when accessing protected routes
    checkAuth();
  }, [location.pathname]); // Re-check on every route change

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-600">Verifying authentication...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Clear any stale data and redirect to login
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdmin();
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-600">Loading...</p>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><UsersManagement /></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute><ProductsManagement /></ProtectedRoute>} />
      <Route path="/admin/sellers" element={<ProtectedRoute><SellersManagement /></ProtectedRoute>} />
      <Route path="/admin/sellers/:sellerId/profile" element={<ProtectedRoute><SellerProfileView /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><Navigate to="/admin/dashboard" replace /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AdminProvider>
      <div>
        <AppRoutes />
      </div>
    </AdminProvider>
  );
}

export default App;

