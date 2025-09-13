import { Routes, Route } from 'react-router-dom';
import { useState } from 'react'
import Homepage from './pages/Homepage'
import Sellersignup from './pages/Sellersignup';
import './App.css'

function App() {

  return (
    <div> 
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/seller-signup" element={<Sellersignup />} />
      </Routes>
    </div>
  );
}

export default App;
