import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import LoginModel from "./LoginModel";
import { useNavigate } from 'react-router-dom'
import { useLocation } from "react-router-dom";

const Navbar = () => {

  const { user, setUser } = useContext(UserContext);
  const [showLogin, setShowLogin] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(15); // Mock cart count

  const navigate = useNavigate();
  const location = useLocation();

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
    }, 300); // Short debounce: 300ms

    return () => clearTimeout(delayDebounce); // Cancel previous timer on every keystroke
  }, [inputValue, navigate, location]);


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
      <div className="nav bg-white px-4 py-3 md:px-10 md:py-4 flex justify-between items-center border-b border-gray-200">
        {/* NexusHub Logo on the left */}
        <div className="logo flex items-center cursor-pointer">
          <div className="text-2xl md:text-3xl font-bold text-blue-600">NexusHub</div>
          <div className="ml-2 flex items-center">
            <span className="text-xs md:text-sm text-gray-600">Explore Plus</span>
            <span className="material-symbols-outlined text-yellow-500 text-sm ml-1">star</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="bg-gray-100 rounded-md flex items-center px-4 py-2">
            <span className="material-symbols-outlined text-gray-500 mr-2">search</span>
            <input
              type="text"
              placeholder='Search for Products, Brands and More'
              className='outline-none bg-transparent w-full text-gray-700'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
        </div>

        {/* Right side navigation */}
        <div className="flex items-center space-x-6 text-gray-700">
          {/* Account */}
          {!user ? (
            <div className="flex items-center cursor-pointer" onClick={() => setShowLogin(true)}>
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
                    <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-3">
                      <span className="material-symbols-outlined text-gray-500">person</span>
                      <span className="text-sm">My Profile</span>
                    </div>
                    <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-3">
                      <span className="material-symbols-outlined text-gray-500">shopping_bag</span>
                      <span className="text-sm">Orders</span>
                    </div>
                    <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-3">
                      <span className="material-symbols-outlined text-gray-500">favorite</span>
                      <span className="text-sm">Wishlist</span>
                    </div>
                    <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-3">
                      <span className="material-symbols-outlined text-gray-500">help</span>
                      <span className="text-sm">Help & Support</span>
                    </div>
                    <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-3">
                      <span className="material-symbols-outlined text-gray-500">settings</span>
                      <span className="text-sm">Settings</span>
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

          {/* Cart with badge */}
          <div className="flex items-center cursor-pointer relative">
            <span className="material-symbols-outlined mr-1">shopping_cart</span>
            <span className="text-sm">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
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

        {showLogin && (
          <LoginModel
            onClose={() => setShowLogin(false)}
            onLoginSuccess={(loggedInUser) => {
              setUser(loggedInUser);
              setShowLogin(false);
            }}
          />
        )}
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

        <div className="icon flex flex-col items-center">
          <span className="material-symbols-outlined">
            shopping_cart
          </span>
          <h1>
            Cart
          </h1>
        </div>

        <div className="icon flex flex-col items-center">
          <span className="material-symbols-outlined">
            account_circle
          </span>
          <h1>
            Profile
          </h1>
        </div>




      </div>}
    </div>

  )
}

export default Navbar