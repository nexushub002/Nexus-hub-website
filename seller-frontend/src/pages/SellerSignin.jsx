import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSeller } from "../context/SellerContext";

const SellerSignin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useSeller();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(email, password);
    
    if (result.success) {
      // Redirect to seller dashboard
      navigate("/seller/dashboard");
    } else {
      setError(result.message || "Invalid email or password");
    }
    
    setLoading(false);
  };

  return (
    <div className="form md:w-3/5 h-screen flex flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:px-12 space-y-6 md:py-10 w-full max-w-md"
        noValidate
      >
        <input
          name="email"
          placeholder="Email"
          className="outline h-10 rounded-lg px-3 border"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          name="password"
          placeholder="Password"
          className="outline h-10 rounded-lg px-3 border"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default SellerSignin;
