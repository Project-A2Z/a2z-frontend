import React from 'react'

const AboutUsSection = () => {
    return (
      <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[16%] min-h-[180px] sm:min-h-[160px] md:min-h-[140px] lg:h-[18vh] flex flex-col justify-end">
        <div className="w-full flex items-center gap-2 sm:gap-3 md:gap-4">
          {/* company name */}
          <div className="flex items-center">
            <span className="font-beiruti font-semibold text-lg sm:text-xl md:text-2xl text-black87">شركة A2Z</span>
          </div>
          
          {/* logo */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex-shrink-0">
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