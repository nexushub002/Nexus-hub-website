import React from 'react'
import Navbar from '../components/Navbar'
import ProductList from '../components/ProductList'
import CategoryList from '../components/CategoryList'



const Homepage = () => {
  return (
    <div>
      <Navbar/>
      <CategoryList/>
      <ProductList/>
    </div>
  )
}

export default Homepage;
