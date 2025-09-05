import React from 'react'
import LogoSection from "@/Pages/AuthPages/ActiveCodePage/sections/LogoSection/Logo";

const AboutUsSection = () => {
    return (
      <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[16%] min-h-[200px] sm:min-h-[180px] md:min-h-[160px] lg:h-[20vh] flex flex-col justify-end items-end ">
        <div className="w-full sm:w-[90%] md:w-[85%] lg:w-[80%] min-h-[8vh] sm:min-h-[7vh] md:min-h-[6vh] flex flex-row justify-between items-center text-center gap-2 sm:gap-3 md:gap-4 opacity-100  mx-auto sm:ml-8 md:ml-10 lg:ml-11 px-2 sm:px-3 md:px-4 lg:px-0">
          {/* company name - positioned on the left */}
          <div className="w-[35%] sm:w-[40%] md:w-[45%] lg:w-[60%] min-h-[6vh] sm:min-h-[5.5vh] md:min-h-[5vh] bg-wight opacity-100 flex justify-start items-center order-1">
            <span className="font-beiruti font-semibold text-lg sm:text-xl md:text-2xl leading-none text-black87 text-left ">شركة A2Z</span>
          </div>
          
          {/* logo - positioned on the right */}
          <div className="w-[35%] sm:w-[40%] md:w-[45%] lg:w-[50%] h-[4vh] sm:h-[4.5vh] md:h-[5vh] lg:h-[100%] opacity-100 rotate-0  order-2">
            <img
            src="/acessts/Logo-picsart.png"
            alt="A2Z Logo"
            className="w-full h-full object-contain"
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