import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { UserContext } from '../context/UserContext';
import LoginPopup from "./LoginPopup";
import { buildApiUrl } from '../config/api';

const Navbar = () => {

  const { user, setUser } = useContext(UserContext);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { getWishlistCount } = useWishlist();
  const { getCartCount, toggleCart } = useCart();

  // Sync input with URL query on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const queryFromUrl = urlParams.get('q');
    if (queryFromUrl && queryFromUrl !== inputValue) {
      setInputValue(queryFromUrl);
    }
  }, [location.search]);

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = setTimeout(async () => {
      const query = inputValue.trim();
      
      if (query && query.length > 1) {
        setIsSearching(true);
        try {
          const url = buildApiUrl(`/api/search?q=${encodeURIComponent(query)}&limit=5`);

          const response = await fetch(url);
          const products = await response.json();
          
          // Extract unique suggestions from product names and categories
          const suggestions = [...new Set([
            ...products.map(p => p.name),
            ...products.map(p => p.category)
          ])].slice(0, 5);
          
          setSearchSuggestions(suggestions);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(fetchSuggestions);
  }, [inputValue]);

  // Navigate to search results
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const query = inputValue.trim();

      if (query) {
        // Always push new query to /search even if already there
        navigate(`/search?q=${encodeURIComponent(query)}`);
      } else {
        // If cleared input, go back to homepage
        if (location.pathname.startsWith("/search")) {
          navigate("/");
        }
      }
    }, 10000); // Longer debounce for navigation: 800ms

    return () => clearTimeout(delayDebounce);
  }, [inputValue, navigate, location]);

  // Handle clicking outside search to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || searchSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < searchSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : searchSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(searchSuggestions[selectedSuggestionIndex]);
        } else {
          handleSearchSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (query) {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const clearSearch = () => {
    setInputValue('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    setSearchSuggestions([]);
  };


  const handleLogout = async () => {

    const url = buildApiUrl('/api/auth/logout');

    await fetch(url, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <div>
      
      
      {/* Desktop Navigation Bar */}
      <div className="nav bg-white px-4 py-1 md:px-6 md:py-5 flex justify-between items-center  border-b border-black/50 hidden md:flex">
        <div className="flex items-center flex-1 min-w-0">

          {/* NexusHub Logo on the left */}
          <div className="logo flex items-center cursor-pointer mr-3" onClick={() => navigate('/')}>
            <img
              src="/Nexushub_logo.png"
              alt="NexusHub logo"
              className="h-7 w-auto object-contain"
            />
          </div>

          <div className="relative hidden md:block mx-5 ">
            <div
              className="flex items-center text-sm text-gray-700 cursor-pointer whitespace-nowrap"
              onClick={() => setShowCategoryDropdown(prev => !prev)}
            >
              <span className="material-symbols-outlined text-[20px] mr-1">menu</span>
              <span>Categories</span>
              <span className="material-symbols-outlined text-sm ml-1">expand_more</span>
            </div>

            {showCategoryDropdown && (
              <div
                className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-40 py-2"
                onMouseLeave={() => setShowCategoryDropdown(false)}
              >
                <div
                  className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    navigate('/category/apparel-accessories');
                    setShowCategoryDropdown(false);
                  }}
                >
                  Apparel & Accessories
                </div>
                <div
                  className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    navigate('/category/jewelry');
                    setShowCategoryDropdown(false);
                  }}
                >
                  Jewelry
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="bg-white border border-gray-300 rounded-full flex items-center pl-4 pr-2 h-[42px] shadow-sm">
                <input
                  type="text"
                  placeholder='Search for Products, Brands and More'
                  className='outline-none bg-transparent w-full text-gray-700'
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setSelectedSuggestionIndex(-1);
                  }}
                  onFocus={() => inputValue.length > 1 && setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
                {inputValue && !isSearching && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="ml-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
                {isSearching && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-2"></div>
                )}
                <button
                  type="submit"
                  className="ml-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">search</span>
                </button>
              </div>
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-80 overflow-y-auto">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`px-4 py-3 cursor-pointer flex items-center border-b border-gray-100 last:border-b-0 transition-colors ${
                      index === selectedSuggestionIndex 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setSelectedSuggestionIndex(index)}
                  >
                    <span className={`material-symbols-outlined mr-3 text-sm ${
                      index === selectedSuggestionIndex ? 'text-blue-500' : 'text-gray-400'
                    }`}>search</span>
                    <span className="text-sm flex-1">{suggestion}</span>
                    {index === selectedSuggestionIndex && (
                      <span className="material-symbols-outlined text-blue-500 text-sm ml-2">arrow_forward</span>
                    )}
                  </div>
                ))}
                <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t">
                  Use ↑↓ to navigate • Enter to select • Esc to close
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side navigation */}
        <div className="flex items-center space-x-6 text-gray-700">
          {/* Account */}
          {!user ? (
            <div className="flex items-center cursor-pointer" onClick={() => setShowLoginPopup(true)}>
              <span className="material-symbols-outlined mr-1">person</span>
              <span className="text-sm">Account</span>
              <span className="material-symbols-outlined text-xs ml-1">keyboard_arrow_down</span>
            </div>
          ) : (
            <div className="relative">
              <div 
                className="flex items-center cursor-pointer"
                onMouseEnter={() => setShowAccountDropdown(true)}
                onMouseLeave={() => setShowAccountDropdown(false)}
              >
                <span className="material-symbols-outlined mr-1">person</span>
                <span className="text-sm">Account</span>
                <span className="material-symbols-outlined text-xs ml-1">keyboard_arrow_down</span>
              </div>
              
              {/* Account Dropdown */}
              {showAccountDropdown && (
                <div 
                  className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border z-50"
                  onMouseEnter={() => setShowAccountDropdown(true)}
                  onMouseLeave={() => setShowAccountDropdown(false)}
                >
                  <div className="p-4 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-600">person</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{user.name || 'User'}</div>
                        <div className="text-sm text-gray-500">{user.phone || user.email}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <div 
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-3"
                      onClick={() => navigate('/myprofile')}
                    >
                      <span className="material-symbols-outlined text-gray-500">person</span>
                      <span className="text-sm">My Profile</span>
                    </div>
                    <div 
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-3"
                      onClick={() => navigate('/orders')}
                    >
                      <span className="material-symbols-outlined text-gray-500">shopping_bag</span>
                      <span className="text-sm">Orders</span>
                    </div>
                    <div 
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                      onClick={() => navigate('/wishlist')}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="material-symbols-outlined text-gray-500">favorite</span>
                        <span className="text-sm">Wishlist</span>
                      </div>
                      {getWishlistCount() > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {getWishlistCount()}
                        </span>
                      )}
                    </div>
                    <div 
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-3"
                      onClick={() => navigate('/help')}
                    >
                      <span className="material-symbols-outlined text-gray-500">help</span>
                      <span className="text-sm">Help & Support</span>
                    </div>
                    <div className="border-t my-2"></div>
                    <div 
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-3 text-red-600"
                      onClick={handleLogout}
                    >
                      <span className="material-symbols-outlined">logout</span>
                      <span className="text-sm">Logout</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cart icon with count */}
          <div className="flex items-center cursor-pointer relative" onClick={toggleCart}>
            <span className="material-symbols-outlined">shopping_cart</span>
            {getCartCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getCartCount()}
              </span>
            )}
          </div>

          {/* Become a Seller */}
          <div 
            className="flex items-center cursor-pointer" 

            onClick={() => window.location.href = `${import.meta.env.VITE_SELLER_FRONTEND_URL}`}
          >
            <span className="material-symbols-outlined mr-1">storefront</span>
            <span className="text-sm">Become a Seller</span>
          </div>

          {/* More options */}
          
        </div>
      </div>

      {/* Mobile Categories Row */}
      
      {/* Mobile Navigation Header */}
      <div className="md:hidden bg-white px-3 py-2 border-b border-black/50">
        <div className="flex items-center space-x-3">
          {/* NexusHub Logo */}
          <div className="logo flex items-center cursor-pointer flex-shrink-0" onClick={() => navigate('/')}>
            <img
              src="/Nexushub_logo.png"
              alt="NexusHub logo"
              className="h-7 w-auto object-contain"
            />
          </div>

          {/* Mobile Search Bar - Full Width */}
          <div className="flex-1 relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="bg-white border border-gray-300 rounded-full flex items-center pl-3 pr-2 h-[40px] shadow-sm">
                <input
                  type="text"
                  placeholder='Search for Products, Brands and More'
                  className='outline-none bg-transparent w-full text-gray-700 text-sm'
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setSelectedSuggestionIndex(-1);
                  }}
                  onFocus={() => inputValue.length > 1 && setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
                {inputValue && !isSearching && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="ml-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
                {isSearching && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-2"></div>
                )}
                <button
                  type="submit"
                  className="ml-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">search</span>
                </button>
              </div>
            </form>

            {/* Mobile Search Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-80 overflow-y-auto">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`px-4 py-3 cursor-pointer flex items-center border-b border-gray-100 last:border-b-0 transition-colors ${
                      index === selectedSuggestionIndex 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setSelectedSuggestionIndex(index)}
                  >
                    <span className={`material-symbols-outlined mr-3 text-sm ${
                      index === selectedSuggestionIndex ? 'text-blue-500' : 'text-gray-400'
                    }`}>search</span>
                    <span className="text-sm flex-1">{suggestion}</span>
                    {index === selectedSuggestionIndex && (
                      <span className="material-symbols-outlined text-blue-500 text-sm ml-2">arrow_forward</span>
                    )}
                  </div>
                ))}
                <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t">
                  Tap to select • Use keyboard for navigation
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden bg-white py-2 flex justify-around items-center text-xs fixed bottom-0 left-0 w-full border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-50">
        <div 
          className="flex flex-col items-center cursor-pointer p-2"
          onClick={() => navigate('/')}
        >
          <span className="material-symbols-outlined text-gray-600 text-xl mb-1">home</span>
          <span className="text-gray-600">Home</span>
        </div>

        <div 
          className="flex flex-col items-center cursor-pointer p-2"
          onClick={() => navigate('/categories')}
        >
          <span className="material-symbols-outlined text-gray-600 text-xl mb-1">category</span>
          <span className="text-gray-600">Category</span>
        </div>

        <div 
          className="flex flex-col items-center cursor-pointer p-2"
          onClick={() => window.location.href = `${import.meta.env.VITE_SELLER_FRONTEND_URL}`}
        >
          <span className="material-symbols-outlined text-gray-600 text-xl mb-1">storefront</span>
          <span className="text-gray-600">Sell</span>
        </div>

        <div 
          className="flex flex-col items-center cursor-pointer p-2 relative"
          onClick={toggleCart}
        >
          <span className="material-symbols-outlined text-gray-600 text-xl mb-1">shopping_cart</span>
          {getCartCount() > 0 && (
            <span className="absolute top-0 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {getCartCount()}
            </span>
          )}
          <span className="text-gray-600">Cart</span>
        </div>

        <div 
          className="flex flex-col items-center cursor-pointer p-2"
          onClick={() => {
            if (!user) {
              setShowLoginPopup(true);
            } else {
              navigate('/myprofile');
            }
          }}
        >
          <span className="material-symbols-outlined text-gray-600 text-xl mb-1">account_circle</span>
          <span className="text-gray-600">{user ? 'Account' : 'Login'}</span>
        </div>
      </div>

      {/* New Login Popup */}
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setShowLoginPopup(false);
        }}
      />
    </div>

  )
}

export default Navbar