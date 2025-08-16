'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import SlideItem from './SlideItem';
import { Button } from '@/components/UI/Buttons/Button';

export interface SlideData {
  id: number;
  image: string;
  title: string;
  description?: string;
  alt?: string;
}

interface ImageSliderProps {
  slides: SlideData[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
  loading?: boolean;
}

const ImageSlider = React.memo(({
  slides,
  autoPlay = true,
  autoPlayInterval = 2000,
  showDots = true,
  showArrows = true,
  className,
  loading = false
}: ImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const goToNext = useCallback(() => {
    if (!isAnimating && slides.length > 0) {
      setIsAnimating(true);
      setCurrentIndex((curr) => (curr === slides.length - 1 ? 0 : curr + 1));
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [isAnimating, slides.length]);

  const goToPrev = useCallback(() => {
    if (!isAnimating && slides.length > 0) {
      setIsAnimating(true);
      setCurrentIndex((curr) => (curr === 0 ? slides.length - 1 : curr - 1));
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [isAnimating, slides.length]);

  const goToSlide = useCallback((slideIndex: number) => {
    if (!isAnimating && slideIndex !== currentIndex) {
      setIsAnimating(true);
      setCurrentIndex(slideIndex);
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [isAnimating, currentIndex]);

  useEffect(() => {
    if (loading || !autoPlay || isPaused || slides.length <= 1 || isAnimating) return;

    intervalRef.current = setInterval(goToNext, autoPlayInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoPlay, autoPlayInterval, isPaused, loading, goToNext, slides.length, isAnimating]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current !== null) {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartXRef.current - touchEndX;
      
      if (Math.abs(diff) > 50) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        diff > 0 ? goToNext() : goToPrev();
      }
      touchStartXRef.current = null;
      setIsPaused(false);
    }
  };

  if (!slides.length) return <div className="h-full flex items-center justify-center">No slides available</div>;

  return (
    <div 
      className={cn("relative h-full w-full overflow-hidden rounded-lg", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Image Slider"
    >
      <div 
        className="flex h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <SlideItem 
            key={slide.id} 
            slide={slide} 
            index={index}
            totalSlides={slides.length}
            isCurrent={index === currentIndex}
          />
        ))}
      </div>

      {showArrows && slides.length > 1 && (
        <>
          <Button 
            onClick={goToPrev}
            className="absolute top-1/2 left-4 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button 
            onClick={goToNext}
            className="absolute top-1/2 right-4 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {showDots && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                currentIndex === index ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

ImageSlider.displayName = 'ImageSlider';
export default React.memo(ImageSlider);