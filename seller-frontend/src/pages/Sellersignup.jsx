import React, { use } from 'react'
import { useState } from 'react';

const Sellersignup = () => {

    let [show,setShow] = useState(false);
    let [email,setEmail] = useState("");
    let [password,setPassword] = useState("");
    let [name,setName]=useState("");
  
    const handleSubmit = (e) => {
  e.preventDefault();
  console.log("Email:", email);
  console.log("Password:", password);
  console.log("Name:", name);
};


  return (
        <div>
            <div className="main h-screen w-full  flex justify-center items-center ">
                <div className="img md:w-[40%] w[0];  object-center relative" >
                    <img 
                    className='h-full hidden md:flex' 
                    src="../../public/nexus_login.jpg" alt="photo" />

                    <div className=" p-1 hidden md:flex bg-[#6161616f] absolute  bottom-20 left-25 text-xl font-bold text-white ">India's biggest B2B hub <p className="mx-1 "> Nexus-Hub</p></div>
                </div>


                <div className="form md:w-[60%] h-screen flex flex-col  ">
                    <form
                     onSubmit={handleSubmit}
                    className="flex flex-col md:px-50  space-y-10 md:py-30  "
                    action="
                    ">

                        <input 
                        placeholder='Email'
                        className="outline h-8 rounded-lg px-2 "
                        type="text" 
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        name="" id="" />

                        <div className="pass border-1 rounded-lg flex items-center">
                            <input 
                        placeholder='Password '
                        className=" h-8 rounded-lg px-2 focus:outline-0 w-[90%]"
                        type={show?"text":"password"}
                         value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        name="" id="" />

                        <p 
                        onClick={()=>setShow(!show)}
                        className="cursor-pointer text-sky-300 text-sm">{show?"hide":"show"} </p>

                        </div>

                        <input
                        placeholder='Full Name'
                        className="outline h-8 rounded-lg px-2"
                         type="text" 
                         value={name}
                         onChange={(e)=>setName(e.target.value)}
                         name="" id="" />

                        <div className="foot flex flex-col space-y-1 justify-center items-center">
                            <button


                            className="w-full h-10 rounded-full bg-[#134490]  text-white"
                            >Create an account</button>
                        <p className='text-sm'>Already have an acount?<a className="font-bold text-base" href=""> sign in</a></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Sellersignup;