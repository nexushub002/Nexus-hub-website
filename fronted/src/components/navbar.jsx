import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import LoginModel from "./LoginModel";
import { useNavigate } from 'react-router-dom'
import { useLocation } from "react-router-dom";

const Navbar = () => {

  const { user, setUser } = useContext(UserContext);
  const [showLogin, setShowLogin] = useState(false);
  const [inputValue, setInputValue] = useState('');

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
      <div className="nav bg-[#134490] px-4 py-3 md:px-10 md:py-6 flex justify-between items-center">
        <div className="logo opacity-0 md:opacity-100">
          <img className=" md:w-45 w-0" src="/nex-logo.jpg" alt="Nexus-hub logo" />
        </div>

        <div className="m md:py-5 py-4 md:w-[600px] w-[65%] md:h-[35px] h-[25px] bg-gray-100 flex rounded-full border-black border-1 items-center focus-within:border-indigo-600" >
          <span className="material-symbols-outlined md:mx-3 mx-1.5  ">
            search
          </span>

          <input
            type="text"
            placeholder='Search Nexus Hub'
            className='outline-none w-full'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        <div className="l cursor-pointer flex justify-between items-center md:space-x-8  space-x-4 text-white">
          <div onClick={() => window.open("http://localhost:5174", "_blank")} className="icon flex flex-col items-center">
            {window.innerWidth > 768 && <span className="material-symbols-outlined">
              storefront
            </span>}


            <h1>
              {window.innerWidth > 768 && <span>Become Seller</span>}
            </h1>

          </div>
          <div className="icon flex flex-col items-center">
            <span className="material-symbols-outlined">
              shopping_cart
            </span>
            <h1>
              {window.innerWidth > 768 && <span>Cart</span>}
            </h1>
          </div>

          {/* <div onClick={() => navigate("/my-profile")} className="icon flex flex-col items-center">
            <span className="material-symbols-outlined">
              person
            </span>
            <h1>
              {window.innerWidth > 768 && <span>Log in</span>}
            </h1>
          </div> */}
          {!user ? (
            <div className="icon flex flex-col items-center" onClick={() => setShowLogin(true)}>
              <span className="material-symbols-outlined">person</span>
              <h1>{window.innerWidth > 768 && <span>Log in</span>}</h1>
            </div>
          ) : (
            <div className="profile-box">
              <button onClick={() => { navigate("/myprofile") }}>Profile</button>
            </div>
          )}

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





      </div>

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
