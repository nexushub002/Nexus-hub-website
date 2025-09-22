import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Sellersignup = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // handleSubmit must be async to use await
  const handleSubmit = async (e) => {
    e.preventDefault(); // stop default form submit

    // basic client-side validation
    if (!mobile && !email) {
      alert("Please provide either mobile or email.");
      return;
    }
    if (!password) {
      alert("Please provide a password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/seller/auth/seller-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // include credentials if your backend uses cookies:
        // credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: mobile.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // optional: store token if returned
        // localStorage.setItem('token', data.token);
        alert("✅ " + (data.message || "Seller account created"));
        navigate("/seller-signin");
      } else {
        alert("❌ " + (data.message || "Signup failed"));
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Server error, try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main h-screen w-full flex justify-center items-center">
      <div className="img md:w-2/5 w-0 object-center relative">
        {/* If image is in public/, use src="/nexus_login.jpg" */}
        <img className="h-full hidden md:flex" src="/nexus_login.jpg" alt="photo" />

        <div className="p-1 hidden md:flex bg-[#6161616f] absolute bottom-20 left-6 text-xl font-bold text-white">
          India's biggest B2B hub <span className="mx-1">Nexus-Hub</span>
        </div>
      </div>

      <div className="form md:w-3/5 h-screen flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col md:px-12 space-y-6 md:py-10" noValidate>
          <input
            name="phone"
            placeholder="Mobile Number"
            className="outline h-8 rounded-lg px-2"
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />

          <input
            name="email"
            placeholder="Email"
            className="outline h-8 rounded-lg px-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="pass border rounded-lg flex items-center px-2">
            <input
              name="password"
              placeholder="Password"
              className="h-8 rounded-lg focus:outline-0 w-full"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShow(!show)}
              className="ml-2 text-sky-300 text-sm"
            >
              {show ? "hide" : "show"}
            </button>
          </div>

          <input
            name="name"
            placeholder="Full Name"
            className="outline h-8 rounded-lg px-2"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="foot flex flex-col space-y-2 justify-center items-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-full bg-[#134490] text-white"
            >
              {loading ? "Creating..." : "Create an account"}
            </button>

            <p className="text-sm">
              Already have an account?
              <a className="font-bold text-base ml-1" href="/seller-signin">
                sign in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sellersignup;
