import React, { useState, useEffect } from 'react'
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full overflow-x-hidden">
      <Navbar/>
      {isMobile && <CategoryList1/>}
      <SlideBar/>
      {!isMobile && <CategoryListImproved/>}
      <FeaturedSectionsImproved/>
      <TopDealsImproved/>
      <ProductList/>
      <Footer/>
    </div>
  )
}

export default Homepage;
