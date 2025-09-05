import { Routes, Route } from "react-router-dom";
import { useState } from 'react'
import Homepage from './pages/Homepage' 
import ProductDetailsPage from './pages/ProductDetailsPage'
import Myprofile from "./pages/Myprofile";
import './App.css'


function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/product-detail/:id" element={<ProductDetailsPage />} />
        <Route path="/my-profile" element={<Myprofile />} />
      </Routes>
    </>
  )
}

export default App
