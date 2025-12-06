import React from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const SlideBar = () => {
  const slides = [
    { 
      id: 1, 
      url: "/Sliderbar_images/first_image.png", 
      alt: "Big Savings Sale",
      title: "Big Savings Sale",
      subtitle: "Up to 80% Off",
      buttonText: "Shop Now"
    },
    { 
      id: 2, 
      url: "/Sliderbar_images/second_image.png", 
      alt: "Electronics Deal",
      title: "Electronics Mega Sale",
      subtitle: "Best Prices Guaranteed",
      buttonText: "Explore"
    },
    { 
      id: 3, 
      url: "/Sliderbar_images/third_image.png", 
      alt: "Fashion Collection",
      title: "New Fashion Collection",
      subtitle: "Trending Styles",
      buttonText: "Discover"
    },
    { 
      id: 4, 
      url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", 
      alt: "Jewelry Collection",
      title: "Premium Jewelry Collection",
      subtitle: "Exclusive Designs",
      buttonText: "Shop Now"
    },
    { 
      id: 5, 
      url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", 
      alt: "Home & Living",
      title: "Home & Living Sale",
      subtitle: "Transform Your Space",
      buttonText: "Explore"
    },
  ];

  return (
    <div className="w-full  bg-white">
      {/* Main Banner Slider */}
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={0}
          loop={true}
          slidesPerView={1}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          pagination={{ 
            clickable: true,
            bulletClass: 'swiper-pagination-bullet-custom',
            bulletActiveClass: 'swiper-pagination-bullet-active-custom'
          }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          touchRatio={1}
          simulateTouch={true}
          allowTouchMove={true}
          className="w-full h-[200px] md:h-[300px] lg:h-[400px]"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative w-full h-full overflow-hidden rounded-lg md:rounded-xl">
                <img 
                  className="w-full h-full object-cover" 
                  src={slide.url} 
                  alt={slide.alt}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x300/6366f1/ffffff?text=' + encodeURIComponent(slide.title);
                  }}
                />
                
                {/* Overlay Content - Hidden on mobile */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center hidden md:flex">
                  <div className="text-white p-4 md:p-8 max-w-md">
                    <h2 className="text-lg md:text-2xl lg:text-3xl font-bold mb-2">
                      {slide.title}
                    </h2>
                    <p className="text-sm md:text-base opacity-90">
                      {slide.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons - Hidden on mobile/tablet */}
        <div className="swiper-button-prev-custom absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 cursor-pointer shadow-lg transition-all duration-200 hidden md:block">
          <span className="material-symbols-outlined text-gray-700">chevron_left</span>
        </div>
        <div className="swiper-button-next-custom absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 cursor-pointer shadow-lg transition-all duration-200 hidden md:block">
          <span className="material-symbols-outlined text-gray-700">chevron_right</span>
        </div>
      </div>

      {/* Custom Pagination Styles */}
      <style jsx>{`
        .swiper-pagination-bullet-custom {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          margin: 0 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .swiper-pagination-bullet-active-custom {
          background: white;
          transform: scale(1.2);
        }
      `}</style>
    </div>
  )
}

export default SlideBar
