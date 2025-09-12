import React from 'react';
import Image from 'next/image';
import { SlideData } from './ImageSlider';

interface SlideContentProps {
  slide: SlideData;
  isActive: boolean;
  isPriority?: boolean;
}

const SlideContent: React.FC<SlideContentProps> = ({
  slide,
  isActive,
  isPriority = false
}) => {
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
        isActive ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Image
        src={slide.image}
        alt={slide.alt}
        fill
        className="object-cover"
        priority={isPriority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4 font-beiruti">
            {slide.title}
          </h2>
          <p className="text-sm md:text-base lg:text-lg opacity-90 font-beiruti">
            {slide.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SlideContent;