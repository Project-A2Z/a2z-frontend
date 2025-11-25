import React from 'react';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      {/* Main Content Container */}
      <div className="relative max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 lg:space-y-12">
          
          {/* Logo Section */}
          <div className="w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] lg:w-[300px] lg:h-[300px] animate-fade-in">
            <div className="relative w-full h-full">
              <Image
                src="/logo/logo2.webp.png"
                alt="A2Z Company Logo - Improve People Life"
                fill
                priority
                className="object-contain drop-shadow-2xl"
                sizes="(max-width: 640px) 200px, (max-width: 1024px) 250px, 300px"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-4 sm:space-y-6 w-full max-w-[348px] sm:max-w-[500px] lg:max-w-[686px] mx-auto" dir="rtl">
            {/* Company Name */}
            <h1 
              className="text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight text-black87 font-beiruti" 
              style={{ fontFamily: 'Beiruti', fontWeight: 600 }}>
              شركة A2Z
            </h1>
            
            {/* Company Description */}
            <div className="text-right font-beiruti text-base sm:text-lg lg:text-xl font-semibold leading-snug sm:leading-normal" 
              style={{ fontFamily: 'Beiruti', fontWeight: 600 }}>
              <p className="text-black60 mx-auto px-2 sm:px-4 lg:px-0">
                هي شركة متخصصة في جميع انواع الكيماويات وخاصة كيماويات البناء الحديث والدهانات المتخصصة
                وكيماويات الصياغة والتجهيز والمواد المساعدة وكيماويات صناعة المنظفات ومستحضرات التجميل.
                وتعتمد الشركة في تميزها على الجمع بين الخبرات المختلفة والتنوع في المنتجات مع التميز في جودة منتجاتها
                . كذلك تعمل الشركة في مجالات معالجة المياه والصرف الصناعي والكيماويات الزراعية والصناعية بأنواعها ،
                كما يوفر خبراء الشركة إستشارات وحلول صناعية وبيئية ودعم فني متميز لكافة الصناعات الكيميائية .
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default React.memo(HeroSection);