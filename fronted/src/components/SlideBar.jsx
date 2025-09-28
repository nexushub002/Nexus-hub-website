import React from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";


  

const SlideBar = () => {

    const slides = [
    { id: 1, color: "bg-blue-500", text: "Slide 1" },
    { id: 2, color: "bg-green-500", text: "Slide 2" },
    { id: 3, color: "bg-red-500", text: "Slide 3" },
    { id: 4, color: "bg-purple-500", text: "Slide 4" },
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
        className="w-full h-[45vh]"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className={`w-full h-full flex items-center justify-center text-white text-4xl ${slide.color}`}
            >
              {slide.text}
            </div>
          </SwiperSlide>
        ))}

      </Swiper>
         
      
     </div>

    </div>
  )
}

export default SlideBar
