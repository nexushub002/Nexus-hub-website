import React, { useState } from 'react';
import LoginModel from '../components/LoginModel';

const Myprofile = () => {
    const [showLogin, setShowLogin] = useState(false);

  const handleLoginSuccess = () => {
    setShowLogin(false);
    // optionally trigger a re-fetch of user info or update global auth state
  };

    return (
        <div>
            <h1>My Profile</h1>
            <p>Manage your profile information here.</p>
            <button onClick={() => setShowLogin(true)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" >Login</button>

            {showLogin && <LoginModel onClose={() => setShowLogin(false)} onLoginSuccess={handleLoginSuccess} />}
        </div>
    );
}

export default Myprofile;
