'use client';

import React from 'react';
import { SlideData } from './Slider';
import { CustomImage } from '@/components/UI/Image/Images';

interface SlideItemProps {
  slide: SlideData;
  index: number;
  totalSlides: number;
  isCurrent: boolean;
}

const SlideItem = React.memo(({ slide, index, totalSlides, isCurrent }: SlideItemProps) => {
  return (
    <div 
      className="w-full flex-shrink-0 relative aspect-[16/9] "
      role="group"
      aria-roledescription="slide"
      aria-label={`Slide ${index + 1} of ${totalSlides}`}
    >
      <CustomImage
        src={slide.image}
        alt={slide.alt || slide.title}
        className="w-full h-full object-cover"
        priority={index === 0 || isCurrent}
        width={1920}
        height={90}
        quality={90}
        fallbackSrc="/images/placeholder.jpg"
      />
      <div
  className="
   absolute
  top-[75%] left-1/2
  w-[80%] h-auto
  sm:top-[70%] sm:w-[50%] sm:h-auto
  md:top-[65%] md:left-[50%] md:w-[20%] md:h-auto md:ml-0
  p-4 sm:p-6 md:p-8
  bg-black
  transform -translate-x-1/2 -translate-y-1/2
  "
>
  <div className="flex flex-col items-center justify-center h-full">
    <div className="text-center">
      <h2 className="font-beiruti text-white font-semibold text-[18px] sm:text-[20px] md:text-[24px] leading-[100%] tracking-[0] mb-2 sm:mb-4">
        {slide.title}
      </h2>
      {slide.description && (
        <p className="font-beiruti text-white font-semibold text-sm sm:text-base md:text-lg leading-[100%] tracking-[0] max-w-full md:max-w-xl">
          {slide.description}
        </p>
      )}
    </div>
  </div>
</div>

    </div>
  );
});

SlideItem.displayName = 'SlideItem';
export default React.memo(SlideItem);
