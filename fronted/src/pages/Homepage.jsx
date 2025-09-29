import React from 'react'
import Navbar from '../components/Navbar'
import ProductList from '../components/ProductList'
import SlideBar from '../components/SlideBar'
import CategoryList from '../components/CategoryList'
import CategoryList1 from '../components/CategoryList1'



const Homepage = () => {
  return (
    <div >
      <Navbar/>
      <CategoryList1/>
      <SlideBar/>
      <CategoryList/>
      <ProductList/>
    </div>
  )
}

export default Homepage;
