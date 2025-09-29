import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react'
import Homepage from './pages/Homepage'
import Sellersignup from './pages/Sellersignup';
import SellerSignin from './pages/SellerSignin';
import Sellerdashboard from './pages/Sellerdashboard';
import AddProduct from './pages/AddProduct';
import { SellerProvider, useSeller } from './context/SellerContext';
import './App.css'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSeller();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/seller-signin" replace />;
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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/seller-signup" element={<PublicRoute><Sellersignup /></PublicRoute>} />
      <Route path="/seller-signin" element={<PublicRoute><SellerSignin /></PublicRoute>} />
      <Route path="/seller/dashboard" element={<ProtectedRoute><Sellerdashboard /></ProtectedRoute>} />
      <Route path="/seller/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
    </Routes>
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
