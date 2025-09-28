import React from 'react'
import Navbar from '../components/Navbar'
import ProductList from '../components/ProductList'
import SlideBar from '../components/SlideBar'



const Homepage = () => {
  return (
    <div>
      <Navbar/>
      <SlideBar/>
      <ProductList/>
    </div>
  )
}

export default Homepage;
