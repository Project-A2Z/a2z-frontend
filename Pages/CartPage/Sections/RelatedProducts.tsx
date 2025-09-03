"use client";
import React, { useEffect, useRef } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';

const RelatedProducts: React.FC = () => {
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    mode: 'free-snap',
    slides: { perView: 2, spacing: 12 },
    breakpoints: {
      '(min-width: 768px)': { slides: { perView: 3, spacing: 16 } },
      '(min-width: 1024px)': { slides: { perView: 6, spacing: 16 } },
    },
  });

  const timerRef = useRef<number | null>(null);
  const start = () => {
    if (timerRef.current) return;
    const slider = instanceRef.current;
    if (!slider) return;
    timerRef.current = window.setInterval(() => slider.next(), 2500);
  };
  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  useEffect(() => {
    start();
    return () => stop();
  }, [instanceRef]);

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-black87 mb-6">منتجات قد تعجبك</h2>
      <div
        ref={sliderRef}
        className="keen-slider"
        onMouseEnter={stop}
        onMouseLeave={start}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div key={item} className="keen-slider__slide">
            <div className="bg-white rounded-lg shadow-sm border p-4 mx-1 hover:shadow-md transition-shadow">
              <div className="aspect-square bg-card rounded-lg mb-3"></div>
              <h3 className="font-medium text-black87 text-sm mb-2">مكمل غذائي</h3>
              <div className="text-primary font-bold">25,000 ج.م</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;


