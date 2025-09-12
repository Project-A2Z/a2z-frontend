import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationArrowsProps {
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

const NavigationArrows: React.FC<NavigationArrowsProps> = ({
  onPrevious,
  onNext,
  className = ''
}) => {
  return (
    <>
      {/* Previous Arrow */}
      <button
        onClick={onPrevious}
        className={`absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 md:p-3 transition-all duration-200 text-white hover:scale-110 ${className}`}
        aria-label="الصورة السابقة"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      
      {/* Next Arrow */}
      <button
        onClick={onNext}
        className={`absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 md:p-3 transition-all duration-200 text-white hover:scale-110 ${className}`}
        aria-label="الصورة التالية"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    </>
  );
};

export default NavigationArrows;