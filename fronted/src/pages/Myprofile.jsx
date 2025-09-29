import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from "../context/UserContext";
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Myprofile = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLoginSuccess = () => {
    setShowLogin(false);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/auth/logout", {
        method: "POST",
        credentials: "include", // important for sessions/cookies
      });

      const data = await res.json();
      console.log("Logout response:", data);

      if (res.ok) {
        // Clear context user
        setUser(null);

        // Redirect to homepage
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div>
       <div className="main bg-white shaodw  w-[70%] m-auto shadow-md shadow-black/40 ">
          <div className="header h-[140px] bg-[#134490] text-white flex justify-between px-12 items-center ">
               <div className="pr ">
                <h1 className=" text-2xl my-3">My Profile</h1>
                <h1 className="text-sm">UserName</h1>
                {user ? (
              <button onClick={handleLogout}>Logout</button>
            ) : (
              <button onClick={() => setShowLogin(true)}>Login</button>
            )}
               </div>
               
          </div>

            <div className="con px-6 py-6">

              <div className="first py-6 text-white flex justify-center flex-wrap space-x-25">

                 <div className="shadow-[0_8px_12px_rgba(19,68,144,0.35)]  box gap-3 hover:border-2 hover:bg-[#5b96f4] hover:border-black hover:scale-105 transition-all duration-300 bg-[#3B82F6] size-32 flex flex-col items-center justify-center  rounded-3xl">
                               
                       <img className=" h-12  group-hover:scale-105 transition-all duration-300" src="../src/assets/basket.png"/>
                        <h1 className=" text-xl">My Orders</h1>
                 </div>

                 <div className=" shadow-[0_8px_12px_rgba(19,68,144,0.35)] box gap-3 hover:border-2 hover:bg-[#5b96f4] hover:border-black hover:scale-105 transition-all duration-300 bg-[#3B82F6] size-32 flex flex-col items-center justify-center  rounded-3xl">
                               
                       <img className="h-12  group-hover:scale-105 transition-all duration-300" src="../src/assets/heart.png"/>
                        <h1 className=" text-xl">Wishlist</h1>
                 </div>

                  <div className="shadow-[0_8px_12px_rgba(19,68,144,0.35)] box gap-3 hover:border-2 hover:bg-[#5b96f4] hover:border-black hover:scale-105 transition-all duration-300 bg-[#3B82F6] size-32 flex flex-col items-center justify-center  rounded-3xl">
                               
                       <img className="h-12  group-hover:scale-105 transition-all duration-300" src="../src/assets/addre.png"/>
                        <h1 className=" text-xl">My Adresses</h1>
                 </div>

                 <div className="shadow-[0_8px_12px_rgba(19,68,144,0.35)] box gap-3 hover:border-2 hover:bg-[#5b96f4] hover:border-black hover:scale-105 transition-all duration-300 bg-[#3B82F6] size-32 flex flex-col items-center justify-center  rounded-3xl">
                               
                       <img className="h-12  group-hover:scale-105 transition-all duration-300" src="../src/assets/buss.png"/>
                        <h1 className=" text-lg text-center">Bussiness Details</h1>
                 </div>


              </div>

              <hr className="border-t border-gray-300 my-6" />

              <div className="second justify-center py-6 text-white flex flex-wrap space-x-25">

                 <div className="shadow-[0_8px_12px_rgba(19,68,144,0.35)]  box gap-3 hover:border-2 hover:bg-[#5b96f4] hover:border-black hover:scale-105 transition-all duration-300 bg-[#3B82F6] size-32 flex flex-col items-center justify-center  rounded-3xl">
                               
                       <img className=" h-12  group-hover:scale-105 transition-all duration-300" src="../src/assets/store.png"/>
                        <h1 className=" text-lg text-center">Sell On NexusHub</h1>
                        
                 </div>

                 <div className=" shadow-[0_8px_12px_rgba(19,68,144,0.35)] box gap-3 hover:border-2 hover:bg-[#5b96f4] hover:border-black hover:scale-105 transition-all duration-300 bg-[#3B82F6] size-32 flex flex-col items-center justify-center  rounded-3xl">
                               
                       <img className="h-12  group-hover:scale-105 transition-all duration-300" src="../src/assets/send.png"/>
                        <h1 className=" text-lg text-center">Your Requirements</h1>
                 </div>

                  <div className="shadow-[0_8px_12px_rgba(19,68,144,0.35)] box gap-3 hover:border-2 hover:bg-[#5b96f4] hover:border-black hover:scale-105 transition-all duration-300 bg-[#3B82F6] size-32 flex flex-col items-center justify-center  rounded-3xl">
                               
                       <img className="h-12  group-hover:scale-105 transition-all duration-300" src="../src/assets/help.png"/>
                        <h1 className=" text-xl">Help Center</h1>
                 </div>
                 
                  <div className="shadow-[0_8px_12px_rgba(19,68,144,0.35)] box gap-3 hover:border-2 hover:bg-[#5b96f4] hover:border-black hover:scale-105 transition-all duration-300 bg-[#3B82F6] size-32 flex flex-col items-center justify-center  rounded-3xl">
                               
                       <img className="h-12  group-hover:scale-105 transition-all duration-300" src="../src/assets/fa.png"/>
                        <h1 className=" text-xl">FAQs</h1>
                 </div>
                 


              </div>

              <hr className="border-t border-gray-300 my-6" />

             
            </div>
       </div>
    </div>
  )
}

export default Myprofile;
