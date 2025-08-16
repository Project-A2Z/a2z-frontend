// components/ImageSlider/SlideItem.tsx
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
      className="w-full h-full flex-shrink-0 relative"
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
        height={1080}
        quality={90}
        fallbackSrc="/images/placeholder.jpg"
      />
      <div className='absolute inset-0 bg-black/40 w-[40%] ml-[20%]'>
        <div className="absolute inset-0 bg-gradient-to-t  from-black/70 to-transparent flex flex-col justify-center p-8 ">
          <h2 className="text-[#EFB036]/90 text-4xl font-bold mb-4">{slide.title}</h2>
          {slide.description && (
            <p className="text-[#F5EEDC]/90 text-xl max-w-2xl">{slide.description}</p>
          )}
        </div>
      </div>
           
    </div>
  );
});

SlideItem.displayName = 'SlideItem';
export default React.memo(SlideItem);