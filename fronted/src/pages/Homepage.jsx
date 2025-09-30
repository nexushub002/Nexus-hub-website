import React from 'react'
import Navbar from '../components/Navbar'
import ProductList from '../components/ProductList'
import SlideBar from '../components/SlideBar'
import CategoryList from '../components/CategoryList'
import CategoryList1 from '../components/CategoryList1'

const Homepage = () => {
  return (
    <div className="pb-16 md:pb-0">
      <Navbar/>
      <CategoryList1/>
      <SlideBar/>
      <CategoryList/>
      <ProductList/>
    </div>
  )
}

export default Homepage;
