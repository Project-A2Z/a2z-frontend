import React from 'react'
import LogoSection from "@/Pages/AuthPages/ActiveCodePage/sections/LogoSection/Logo";

const AboutUsSection = () => {
    return (
      <div className="w-[16%] h-[20vh]  flex flex-col    justify-end items-end">
        <div className="w-[80%] min-h-[6vh] flex flex-row justify-center items-center text-center  gap-4 opacity-100 ">
          {/* logo */}
          <div className="w-[50%] h-[100%] opacity-100 rotate-0 ">
            <img
            src="/acessts/Logo-picsart.png"
            alt="A2Z Logo"
            className="w-full h-full object-contain"
            />
			    </div>
          {/* company name */}
          <div className="w-[88%] h-[5vh] bg-wight opacity-100 flex mt-[10%] justify-end">
            <span className="font-beiruti font-semibold text-2xl leading-none text-black87 ">A2Z  شركة </span>
          </div>
        </div>
        <p className="w-[100%] h-[70%] opacity-100 rotate-0 text-base leading-none tracking-normal text-right font-medium font-beiruti pt-8 ">
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