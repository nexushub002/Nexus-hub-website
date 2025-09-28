import { Routes, Route } from 'react-router-dom';
import { useState } from 'react'
import Homepage from './pages/Homepage'
import Sellersignup from './pages/Sellersignup';
import SellerSignin from './pages/SellerSignin';
import Sellerdashboard from './pages/Sellerdashboard';
import AddProduct from './pages/AddProduct';
import './App.css'

function App() {

  return (
    <div> 
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/seller-signup" element={<Sellersignup />} />
        <Route path="/seller-signin" element={<SellerSignin />} />
        <Route path="/seller/dashboard" element={<Sellerdashboard />} />
        <Route path="/seller/add-product" element={<AddProduct />} />
      </Routes>
    </div>
  );
}

export default App;
