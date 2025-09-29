import React from "react";
import { useNavigate } from 'react-router-dom'
import { useState } from "react";
import { useSeller } from '../context/SellerContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated, seller, logout } = useSeller();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleLoginClick = () => {
    navigate("/seller-signin");
  };

  const handleSignupClick = () => {
    navigate("/seller-signup");
  };

  const handleDashboardClick = () => {
    navigate("/seller/dashboard");
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="text-2xl font-bold">
                <span className="text-gray-900">Nexus</span>
                <span className="text-blue-600 ml-1">Hub</span>
              </div>
              <div className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                Seller
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium flex items-center transition-colors duration-200"
                >
                  Solutions
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                    <a href="#pricing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                      Pricing
                    </a>
                    <a href="#shipping" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                      Shipping
                    </a>
                    <a href="#advertising" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                      Advertising
                    </a>
                    <a href="#marketplace" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                      Buy on NexusHub
                    </a>
                  </div>
                )}
              </div>
              
              <a href="#features" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                Features
              </a>
              <a href="#support" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                Support
              </a>
            </div>
          </div>

          {/* Authentication Buttons */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {seller?.name?.charAt(0) || seller?.email?.charAt(0) || 'S'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700 font-medium">
                    {seller?.name || seller?.email || 'Seller'}
                  </span>
                </div>
                <button 
                  onClick={handleDashboardClick} 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors duration-200"
                >
                  Dashboard
                </button>
                <button 
                  onClick={handleLogout} 
                  className="text-gray-600 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleLoginClick} 
                  className="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Login
                </button>
                <button 
                  onClick={handleSignupClick} 
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors duration-200"
                >
                  Start Selling
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600">
                Features
              </a>
              <a href="#pricing" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600">
                Pricing
              </a>
              <a href="#support" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600">
                Support
              </a>
              
              {isAuthenticated ? (
                <div className="border-t border-gray-200 pt-4">
                  <div className="px-3 py-2">
                    <span className="text-sm text-gray-600">
                      Welcome, {seller?.name || seller?.email || 'Seller'}
                    </span>
                  </div>
                  <button 
                    onClick={handleDashboardClick} 
                    className="block w-full text-left px-3 py-2 text-base font-medium text-blue-600"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={handleLogout} 
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-600"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <button 
                    onClick={handleLoginClick} 
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700"
                  >
                    Login
                  </button>
                  <button 
                    onClick={handleSignupClick} 
                    className="block w-full text-left px-3 py-2 text-base font-medium text-blue-600"
                  >
                    Start Selling
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
