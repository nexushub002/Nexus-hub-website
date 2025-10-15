import React from 'react'
import Navbar from '../components/Navbar'
import ProductList from '../components/ProductList'
import SlideBar from '../components/SlideBar'
import CategoryList from '../components/CategoryList'
import CategoryList1 from '../components/CategoryList1'
import FeaturedSectionsImproved from '../components/FeaturedSectionsImproved'
import TopDealsImproved from '../components/TopDealsImproved'
import '../components/FeaturedSections.css'

const Homepage = () => {
  return (
    <div className="w-full overflow-x-hidden pb-16 md:pb-0">
      <Navbar/>
      <CategoryList1/>
      <SlideBar/>
      <CategoryList/>
      <FeaturedSectionsImproved/>
      <TopDealsImproved/>
      <ProductList/>
    </div>
  )
}

export default Homepage;
