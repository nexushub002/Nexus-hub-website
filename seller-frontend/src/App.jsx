import { Routes, Route } from 'react-router-dom';
import { useState } from 'react'
import Homepage from './pages/Homepage'
import Sellersignup from './pages/Sellersignup';
import SellerSignin from './pages/SellerSignin';
import Sellerdashboard from './pages/Sellerdashboard';
import './App.css'

function App() {

  return (
    <div> 
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/seller-signup" element={<Sellersignup />} />
        <Route path="/seller-signin" element={<SellerSignin />} />
        <Route path="/seller/dashboard" element={<Sellerdashboard />} />
      </Routes>
    </div>
  );
}

export default App;
