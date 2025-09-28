import React from 'react'
import Navbar from '../components/Navbar'
import ProductList from '../components/ProductList'
import SlideBar from '../components/SlideBar'
import CategoryList from '../components/CategoryList'



const Homepage = () => {
  return (
    <div>
      <Navbar/>
      <SlideBar/>
      <CategoryList/>
      <ProductList/>
    </div>
  )
}

export default Homepage;
