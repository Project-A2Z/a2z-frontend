'use client';

import React, { useState, useEffect, useCallback } from 'react';
import NavigationArrows from './NavigationArrows';
import DotIndicators from './DotIndicators';
import SlideContent from './SlideContent';

export interface SlideData {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  alt: string;
}

interface ImageSliderProps {
  slides?: SlideData[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  slides = [],
  autoPlay = true,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  className = ''
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const nextSlide = useCallback(() => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto play functionality
  useEffect(() => {
    if (!isPlaying || slides.length <= 1) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide, autoPlayInterval, slides.length]);

  // Pause auto play on hover
  const handleMouseEnter = () => {
    if (autoPlay) setIsPlaying(false);
  };

  const handleMouseLeave = () => {
    if (autoPlay) setIsPlaying(true);
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">لا توجد صور للعرض</p>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full h-96 md:h-[500px] lg:h-[600px] overflow-hidden rounded-lg shadow-lg ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main slider container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <SlideContent
            key={slide.id}
            slide={slide}
            isActive={index === currentSlide}
            isPriority={index === 0}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      {showArrows && slides.length > 1 && (
        <NavigationArrows
          onPrevious={prevSlide}
          onNext={nextSlide}
        />
      )}

      {/* Dots indicator */}
      {showDots && slides.length > 1 && (
        <DotIndicators
          totalSlides={slides.length}
          currentSlide={currentSlide}
          onDotClick={goToSlide}
        />
      )}

      {/* Loading indicator for first slide */}
      {currentSlide === 0 && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400">جاري التحميل...</div>
        </div>
      )}
    </div>
  );
};

export default ImageSlider;