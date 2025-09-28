import React from "react";
import { useNavigate } from 'react-router-dom'
import { useState } from "react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [clicked, setClicked] = useState(false);

  const navigate = useNavigate();

  const handleClick = () => {
    if (clicked) {
      setOpen(false);
      setClicked(false);
    } else {
      setOpen(true);
      setClicked(true);
    }
  };

  const handleMouseEnter = () => {
    if (!clicked) setOpen(true);
  };

  const handleMouseLeave = () => {
    if (!clicked) setOpen(false);
  };

  return (
    <div className="mx-30 my-5">
       <div className="  h-[60px] flex justify-between border-b-2 shadow-blue-300/4 items-center">
        <h1
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          className=" 
           relative text-3xl  flex hover:scale-105 transition-all duration-300"
        >
          {" "}
          Nexus <h1 className="mx-2 text-[#134490]">Hub</h1>
          {open && (
            <ul
              className={`
           ${open ? "opacity-100" : "opacity-0 "}
         absolute top-8 mt-2 w-48 bg-[#134490] text-white shadow-lg rounded-lg py-2 z-10 flex flex-col`}
            >
              <li href="#" className=" px-4 py-2 text-sm hover:bg-sky-950">
                Pricing
              </li>
              <li href="#" className=" px-4 py-2 text-sm   hover:bg-sky-950">
                Shipping
              </li>
              <li href="#" className=" px-4 py-2 text-sm  hover:bg-sky-950">
                Advertize
              </li>

              <li href="#" className=" px-4 py-2 text-sm  hover:bg-sky-950 ">
                Buy on NexusHub
              </li>
            </ul>
          )}
        </h1>

        <button onClick={() => navigate("/seller-signup")} className="mr-20 bg-[#134490] text-white px-6 py-3 rounded-full mb-2 font-bold hover:scale-105 transition-all duration-300 ">
          Login
        </button>
      </div>

      <div className="main flex justify-between  my-10 h-[45vh] items-center">
        <div className="l">
          <h1 className=" text-4xl mb-5 font-bold flex">
            Open your shop on{" "}
            <section className=" text-[#134490] mx-2">NexusHub</section> now !
          </h1>
          <h1 className=" text-2xl font-semibold flex">
            {" "}
            Sell your product on India's B2B Hub-
            <section className="mx-2 text-[#134490]">NexusHub</section>{" "}
          </h1>
          <button onClick={() => navigate("/seller-signup")} className="bg-[#3b82f6] rounded-lg my-12 text-lg font-bold hover:scale-105 transition-all duration-300  hover:bg-[#134490] text-white px-5 py-3">
            Start Selling
          </button>
        </div>

        <div className="img">
          <img
            className="h-75  mr-10 hover:scale-105  transition-all duration-300"
            src="../src/assets/agent.png"
            alt=""
          />
        </div>
      </div>

      <div className="sec my-20 ">
        <div className="head text-3xl font-semibold">How does this work?</div>

        <div className="bottom mt-10 flex mx-25 justify-center space-x-10">

          <div className="box pb-5 px-4 size-65 h-[220px] rounded-xl border-1 border-[#b3b3b3]">

            <h1 className="font-bold text-xl text-[#134490] my-6">Create Seller Account</h1>
            <h1 className=" text-lg">
              Register on NexusHub Seller with your Phone Number, Email ID &
              GST details.
            </h1>
          </div>

          <div className="box pb-5 px-4 size-65 h-[220px] rounded-xl border-1 border-[#b3b3b3]">

            <h1 className="font-bold text-xl text-[#134490] my-6">List Your Products</h1>
            <h1 className=" text-lg">
              List your products with all required details in the “Add Product” section of the Seller Dashboard.
            </h1>
          </div>

           <div className="box pb-5 px-4 size-65 h-[220px] rounded-xl border-1 border-[#b3b3b3]">

            <h1 className="font-bold text-xl text-[#134490] my-6">Get Orders</h1>
            <h1 className=" text-lg">
             Start receiving orders directly from businesses, retailers & individual customers.
            </h1>
          </div>


        </div>

      </div>

      <div className="max-w-7xl  px-6 py-12">
      <h2 className="text-2xl md:text-3xl font-bold mb-10">
        Why NexusHub?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Free Listing */}
        <div className="bg-blue-50 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition duration-300">
               
               <img
            className=" m-auto h-20 my-5  "
            src="../src/assets/check-list.png"
            alt=""
          />

          <h3 className="text-xl font-semibold text-[#134490] mb-2">
            Free Listing
          </h3>
          <p className="text-gray-600 text-base">
            List unlimited products on NexusHub free of charge.
          </p>
        </div>

        {/* 5% Commission */}
        <div className="bg-blue-50 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition duration-300">
           
            <img
            className=" m-auto h-20 my-5  "
            src="../src/assets/saving.png"
            alt=""
          />
          <h3 className="text-xl font-semibold text-[#134490] mb-2">
            5% Commission
          </h3>
          <p className="text-gray-600 text-base">
            Sellers on NexusHub pay only 5% Commission on Sales.
          </p>
        </div>

        {/* Start Export */}
        <div className="bg-blue-50 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition duration-300">
         
            <img
            className=" m-auto h-20 my-5  "
            src="../src/assets/planet-earth.png"
            alt=""
          />

          <h3 className="text-xl font-semibold text-[#134490] mb-2">
            Start Export
          </h3>
          <p className="text-gray-600 text-base">
            Expand your business globally with NexusHub and get bulk orders
            from international buyers.
          </p>
        </div>

        {/* Logistics */}
        <div className="bg-blue-50 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition duration-300">
            
            <img
            className=" m-auto h-20 my-5  "
            src="../src/assets/shipped.png"
            alt=""
          />
          <h3 className="text-xl font-semibold text-[#134490]  mb-2">Logistics</h3>
          <p className="text-gray-600 text-base">
            NexusHub manages logistics for your orders to make your business
            easier.
          </p>
        </div>

      </div>

    </div>


   </div>
  );
};

export default Navbar;
