import React from 'react'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {

  const navigate = useNavigate();

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

          <input placeholder='Search Nexus Hub' className='outline-none w-full ' />
        </div>

        <div className="l cursor-pointer flex justify-between items-center md:space-x-8  space-x-4 text-white">
          <div onClick={() => window.open("http://localhost:5174", "_blank")} className="icon flex flex-col items-center">
            {window.innerWidth > 768 && <span class="material-symbols-outlined">
              storefront
            </span>}


            <h1>
              {window.innerWidth > 768 && <span>Become Seller</span>}
            </h1>

          </div>
          <div className="icon flex flex-col items-center">
            <span class="material-symbols-outlined">
              shopping_cart
            </span>
            <h1>
              {window.innerWidth > 768 && <span>Cart</span>}
            </h1>
          </div>

          <div onClick={() => navigate("/my-profile")} className="icon flex flex-col items-center">
            <span class=" material-symbols-outlined">
              person
            </span>
            <h1>
              {window.innerWidth > 768 && <span>Log in</span>}
            </h1>
          </div>


        </div>





      </div>

      {window.innerWidth < 768 && <div className="reso py-3 flex justify-around items-center text-sm fixed bottom-0 left-0 w-full  shadow-[0_-2px_5px_rgba(0,0,0,0.2)] z-50">
        <div className="icon flex flex-col items-center">
          <span class="material-symbols-outlined">
            Home
          </span>
          <h1>
            Home
          </h1>
        </div>
        <div className="icon flex flex-col items-center">
          <span class="material-symbols-outlined">
            view_cozy
          </span>
          <h1>
            Category
          </h1>
        </div>


        <div className="icon flex flex-col items-center">
          <span class="material-symbols-outlined">
            search
          </span>
          <h1>
            Search
          </h1>
        </div>

        <div className="icon flex flex-col items-center">
          <span class="material-symbols-outlined">
            shopping_cart
          </span>
          <h1>
            Cart
          </h1>
        </div>

        <div className="icon flex flex-col items-center">
          <span class="material-symbols-outlined">
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
