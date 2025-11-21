'use client';
import React, { useState, useEffect } from 'react';
import { Slider } from '../../../../components/UI/Slider';
import type { SlideItem } from '../../../../components/UI/Slider';
const MainSection = React.memo(() => {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  useEffect(() => {
    const data: SlideItem[] = [
      {
        src: '/slider/main.webp',
        alt: '',
        title: '',
        caption: '',
        isArabic: true,
      },
      {
        src: '/slider/1.webp',
        alt: '',
        title: '',
        caption: '',
        isArabic: true,
      },
      {
        src: '/slider/2.webp',
        alt: '',
        title: '',
        caption: '',
        isArabic: true,
      },
      {
        src: '/slider/3.webp',
        alt: '',
        title: '',
        caption: '',
        isArabic: true,
      },
    ];
    setSlides(data);
  }, []);

  return (
    <section className="w-full  rotate-0 opacity-100 mt-[72px] md:mt-[94px]">
      <div className="w-full">
        {/* Slider wrapper: full width at all breakpoints, responsive heights */}
        <div className="w-full">
          <div className="w-full h-[232px] sm:h-[360px] md:h-[520px] lg:h-[650px] xl:h-[710px]">
            <Slider
              slides={slides}
              autoPlay
              intervalMs={5000}
              showDots
              showButtons={false}
              showArrows={true}
              useAspect={false}
              height="100%"
              width="100%"
              className="w-full h-full"
            />
          </div>
        </div>
        {/* Title block under slider */}
        <div className="w-full max-w-[1440px] mx-auto text-center mt-4">
          <h2 className="font-beiruti font-bold text-[20px] sm:text-[24px] md:text-[28px] leading-snug text-gray-800">
            منتجاتنا و خدماتنا
          </h2>
          <p className="font-beiruti font-medium text-[14px] sm:text-[16px] leading-snug text-gray-700 mt-1 sm:mt-2">
            جميع الكيميائيات في مكان واحد
          </p>
        </div>
      </div>
    </section>
  );
});

MainSection.displayName = 'MainSection';
export default React.memo(MainSection);