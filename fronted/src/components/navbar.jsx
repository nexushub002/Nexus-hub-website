import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { UserContext } from '../context/UserContext';
import LoginPopup from "./LoginPopup";

const Navbar = () => {

  const { user, setUser } = useContext(UserContext);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
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
          const response = await fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(query)}&limit=5`);
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
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (query) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };


  const handleLogout = async () => {
    await fetch("http://localhost:3000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <div>
      {/* Top blue strip */}
      <div className="bg-blue-600 h-1 w-full"></div>
      
      {/* Main navigation bar */}
      <div className="nav bg-white px-4 py-2 md:px-8 md:py-3 flex justify-between items-center border-b border-gray-200">
        {/* NexusHub Logo on the left */}
        <div className="logo flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex flex-col leading-tight">
            <div className="flex items-center">
              <span className="text-[10px] md:text-xs text-gray-600">Explore Plus</span>
              <span className="material-symbols-outlined text-yellow-500 text-xs ml-1">star</span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-blue-600">NexusHub</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-3 md:mx-4 relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <div className="bg-gray-100 rounded-md flex items-center px-3 md:px-4 py-2 h-[36px] md:h-[40px]">
              <span className="material-symbols-outlined text-gray-500 mr-2">search</span>
              <input
                type="text"
                placeholder='Search for Products, Brands and More'
                className='outline-none bg-transparent w-full text-gray-700'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => inputValue.length > 1 && setShowSuggestions(true)}
              />
              {isSearching && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
            </div>
          </form>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1">
              {searchSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span className="material-symbols-outlined text-gray-400 mr-3 text-sm">search</span>
                  <span className="text-gray-700 text-sm">{suggestion}</span>
                </div>
              ))}
            </div>
          )}
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
            onClick={() => window.open("http://localhost:5174", "_blank")}
          >
            <span className="material-symbols-outlined mr-1">storefront</span>
            <span className="text-sm">Become a Seller</span>
          </div>

          {/* More options */}
          <div className="flex items-center cursor-pointer">
            <span className="material-symbols-outlined">more_vert</span>
          </div>
        </div>

      </div>

      {/* Mobile bottom navigation - unchanged */}
      {window.innerWidth < 768 && <div className="reso py-3 flex justify-around items-center text-sm fixed bottom-0 left-0 w-full  shadow-[0_-2px_5px_rgba(0,0,0,0.2)] z-50">
        <div className="icon flex flex-col items-center">
          <span className="material-symbols-outlined">
            Home
          </span>
          <h1>
            Home
          </h1>
        </div>
        <div className="icon flex flex-col items-center">
          <span className="material-symbols-outlined">
            view_cozy
          </span>
          <h1>
            Category
          </h1>
        </div>


        <div className="icon flex flex-col items-center">
          <span className="material-symbols-outlined">
            search
          </span>
          <h1>
            Search
          </h1>
        </div>

        <div className="icon flex flex-col items-center relative" onClick={toggleCart}>
          <span className="material-symbols-outlined">
            shopping_cart
          </span>
          {getCartCount() > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {getCartCount()}
            </span>
          )}
          <h1>
            Cart
          </h1>
        </div>

        <div 
          className="icon flex flex-col items-center cursor-pointer"
          onClick={() => {
            if (!user) {
              setShowLoginPopup(true);
            } else {
              navigate('/myprofile');
            }
          }}
        >
          <span className="material-symbols-outlined">
            account_circle
          </span>
          <h1>
            {user ? 'Profile' : 'Login'}
          </h1>
        </div>




      </div>}

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