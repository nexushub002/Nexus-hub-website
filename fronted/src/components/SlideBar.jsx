import React from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";


  

const SlideBar = () => {

    const slides = [
    { id: 1, url: "/Sliderbar_images/122911c45334a187.webp" , alt: "Slide 1" },
    { id: 2, url: "/Sliderbar_images/707b1aae8941c3cc.webp" , alt: "Slide 2" },
    { id: 3, url: "/Sliderbar_images/f12b23456036aa64.webp" , alt: "Slide 3"   },
    { id: 4, url: "/Sliderbar_images/f12b23456036aa64.webp" , alt: "Slide 4" },
  ];

  return (
    <div>
       <div className="bar  w-full">
     <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        loop={true}
        slidesPerView={1}
        navigation
          pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        className="w-full h-[40vh]"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className={`w-full h-full flex items-center justify-center text-white text-4xl ${slide.color}`}
            >
              <img className='h-full w-full' src={slide.url} alt={slide.alt} />
            </div>
          </SwiperSlide>
        ))}

      </Swiper>
         
      
     </div>

    </div>
  )
}

export default SlideBar
