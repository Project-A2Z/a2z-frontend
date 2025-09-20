import React from 'react'
import LogoSection from "@/Pages/AuthPages/ActiveCodePage/sections/LogoSection/Logo";

const AboutUsSection = () => {
    return (
      <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[16%] min-h-[180px] sm:min-h-[160px] md:min-h-[140px] lg:h-[18vh] flex flex-col justify-end items-end ">
        <div className="w-full sm:w-[95%] md:w-[90%] lg:w-[85%] min-h-[7vh] sm:min-h-[6vh] md:min-h-[5vh] flex flex-row  items-center gap-1 sm:gap-2 md:gap-3 mx-auto px-1 sm:px-2">
          {/* company name - positioned on the left */}
          <div className="w-[45%] sm:w-[40%] md:w-[50%] lg:w-[55%] min-h-[5vh] sm:min-h-[4.5vh] flex justify-start items-center ">
            <span className="font-beiruti font-semibold text-base sm:text-lg md:text-xl lg:text-2xl text-black87">شركة A2Z</span>
          </div>
          
          {/* logo - positioned on the right */}
          <div className="w-[40%] sm:w-[30%] md:w-[40%]   lg:w-[40%] h-[4vh] sm:h-[4.5vh] md:h-[5vh] lg:h-[90%] flex  ">
            <img
            src="/acessts/Logo-picsart.png"
            alt="A2Z Logo"
            className="w-full h-full object-contain "
            />
          </div>
        </div>
        <p className="w-full h-auto lg:h-[70%] opacity-100 rotate-0 text-sm sm:text-base leading-relaxed sm:leading-none tracking-normal text-right font-medium font-beiruti pt-4 sm:pt-6 md:pt-7 lg:pt-8 px-2 sm:px-3 md:px-4 lg:px-0">
          شركة متخصصة في جميع انواع الكيماويات
          وخاصة كيماويات البناء الحديث والدهانات
          المتخصصة وكيماويات الصباغة والتجهيز 
          والمواد المساعدة وكيماويات صناعة 
          المنظفات ومستحضرات التجميل
        </p>

      </div>
    );
  };
export default React.memo(AboutUsSection)