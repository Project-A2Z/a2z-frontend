"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";

//components
import SplitText from "@/components/UI/SpiltText/SpiltText";

export type SlideItem = {
  src: string | StaticImageData;
  alt?: string;
  title?: string;
  caption?: string;
  isArabic?: boolean;
};

export interface SliderProps {
  slides: SlideItem[];
  autoPlay?: boolean;
  intervalMs?: number;
  className?: string;
  rounded?: boolean;
  showArrows?: boolean;
  showButtons?: boolean;
  showDots?: boolean;
  aspectClassName?: string;
  titleClassName?: string;
  captionClassName?: string;
  useAspect?: boolean;
  dotsGapPx?: number;
  width?: number | string;
  height?: number | string;
}

const clampIndex = (idx: number, len: number) => {
  if (len === 0) return 0;
  return (idx + len) % len;
};

const Slider: React.FC<SliderProps> = ({
  slides,
  autoPlay = true,
  intervalMs = 5000,
  className = "",
  rounded = true,
  showArrows = true,
  showButtons,
  showDots = true,
  aspectClassName,
  titleClassName,
  captionClassName,
  useAspect = true,
  dotsGapPx = 8,
  width,
  height,
}) => {
  const [current, setCurrent] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  // Filter out any invalid slide entries that could break next/image
  const validSlides = useMemo(
    () =>
      (slides || []).filter((s) => {
        const src = (s as SlideItem | undefined)?.src as unknown;
        if (!src) return false;
        if (typeof src === "string") return src.length > 0;
        if (typeof src === "object" && (src as StaticImageData).src) return true;
        return false;
      }),
    [slides]
  );
  const len = validSlides.length;

  // Ensure current index is valid whenever slides change
  useEffect(() => {
    setCurrent((c) => clampIndex(c, len));
  }, [len]);

  const goTo = useCallback(
    (idx: number) => setCurrent((prev) => clampIndex(idx, len)),
    [len]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // autoplay timer
  useEffect(() => {
    if (!autoPlay || isHovering || len <= 1) return;
    const id = setInterval(() => {
      setCurrent((c) => clampIndex(c + 1, len));
    }, intervalMs);
    return () => clearInterval(id);
  }, [autoPlay, isHovering, intervalMs, len]);

  // keyboard navigation
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // touch swipe
  const startX = useRef<number | null>(null);
  const deltaX = useRef<number>(0);
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    deltaX.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    deltaX.current = e.touches[0].clientX - startX.current;
  };
  const onTouchEnd = () => {
    if (Math.abs(deltaX.current) > 50) {
      if (deltaX.current < 0) next();
      else prev();
    }
    startX.current = null;
    deltaX.current = 0;
  };

  const aspect = useMemo(() => {
    if (aspectClassName) return aspectClassName;
    // default responsive aspect ratios
    return "aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]";
  }, [aspectClassName]);

  const useFixedSize = typeof width !== 'undefined' || typeof height !== 'undefined' || !useAspect;

  const sizeStyle = useMemo<React.CSSProperties>(() => {
    const s: React.CSSProperties = {};
    if (typeof width !== 'undefined') {
      s.width = typeof width === 'number' ? `${width}px` : width;
    }
    if (typeof height !== 'undefined') {
      s.height = typeof height === 'number' ? `${height}px` : height;
    }
    return s;
  }, [width, height]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Image slider"
      className={`relative w-full select-none outline-none ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className={`relative ${useFixedSize ? '' : `w-full ${aspect}`} overflow-hidden ${
          rounded ? "rounded-xl" : ""
        } bg-neutral-200 dark:bg-neutral-800`}
        style={useFixedSize ? sizeStyle : undefined}
      >
        {/* Slides */}
        <div
          className="relative h-full w-full"
          style={{
            // stack slides on top of each other; only active is fully visible
            // we still render all for smoother transitions and to allow fade
          }}
        >
          {validSlides.map((slide, idx) => (
            <div
              key={idx}
              aria-hidden={idx !== current}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === current ? "opacity-100" : "opacity-0"
              }`}
            >
              {slide.src && (
                <Image
                  src={slide.src as string | StaticImageData}
                  alt={slide.alt || `Slide ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  className="object-cover object-center w-full h-full"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
                  // loading="lazy"
                />
              )}

              {/* dark gradient overlay for readability */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

              {/* Centered overlay content */}
              {(slide.title || slide.caption) && (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div
                    className="text-center  text-white  w-[214px] h-[58px] mx-auto flex flex-col items-center justify-center gap-[10px] opacity-100 "
                    style={{ transform: 'rotate(0deg)' }}
                  >
                    {slide.title && (
                      <SplitText
                        text={slide.title}
                        tag="h2"
                        className="font-beiruti font-semibold text-[24px] leading-[100%] tracking-[0]"
                        isArabic={slide.isArabic}
                        splitType={slide.isArabic ? "words" : "chars"}
                        from={{ opacity: 0, y: 10 }}
                        to={{ opacity: 1, y: 0 }}
                        delay={50}
                        duration={0.5}
                      />
                    )}
                    {slide.caption && (
                      <SplitText
                        text={slide.caption}
                        tag="p"
                        className="font-beiruti font-medium text-[16px] leading-[100%] tracking-[0] text-white/90"
                        isArabic={slide.isArabic}
                        splitType={slide.isArabic ? "words" : "chars"}
                        from={{ opacity: 0, y: 8 }}
                        to={{ opacity: 1, y: 0 }}
                        delay={40}
                        duration={0.45}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Arrows */}
        {(typeof showButtons === 'boolean' ? showButtons : showArrows) && len > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {/* Dots */}
        {showDots && len > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
            {validSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 w-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary1/80 ${
                  current === idx ? "bg-secondary1 w-5" : "bg-secondary1/40 hover:bg-secondary1/60"
                }`}
              />)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Slider);