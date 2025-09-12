import React from 'react';

interface DotIndicatorsProps {
  totalSlides: number;
  currentSlide: number;
  onDotClick: (index: number) => void;
  className?: string;
}

const DotIndicators: React.FC<DotIndicatorsProps> = ({
  totalSlides,
  currentSlide,
  onDotClick,
  className = ''
}) => {
  return (
    <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 rtl:space-x-reverse ${className}`}>
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-200 ${
            index === currentSlide
              ? 'bg-white scale-125'
              : 'bg-white/50 hover:bg-white/75'
          }`}
          aria-label={`انتقل إلى الصورة ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default DotIndicators;