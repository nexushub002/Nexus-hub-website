import React from 'react'
import Navbar from '../components/Navbar'
import ProductList from '../components/ProductList'
import SlideBar from '../components/SlideBar'
import CategoryListImproved from '../components/CategoryListImproved'
import CategoryList1 from '../components/CategoryList1'
import FeaturedSectionsImproved from '../components/FeaturedSectionsImproved'
import TopDealsImproved from '../components/TopDealsImproved'
import Footer from '../components/Footer'
import '../components/FeaturedSections.css'

const Homepage = () => {
  return (
    <div className="w-full overflow-x-hidden">
      <Navbar/>
      <CategoryList1/>
      <SlideBar/>
      <CategoryListImproved/>
      <FeaturedSectionsImproved/>
      <TopDealsImproved/>
      <ProductList/>
      <Footer/>
    </div>
  )
}

export default Homepage;
