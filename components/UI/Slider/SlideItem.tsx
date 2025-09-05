'use client';

import React from 'react';
import { SlideData } from './Slider';
import { CustomImage } from '@/components/UI/Image/Images';
import styles from './slider.module.css';

interface SlideItemProps {
  slide: SlideData;
  index: number;
  totalSlides: number;
  isCurrent: boolean;
}

const SlideItem = React.memo(({ slide, index, totalSlides, isCurrent }: SlideItemProps) => {
  return (
    <div 
      className={styles.slideContainer}
      role="group"
      aria-roledescription="slide"
      aria-label={`Slide ${index + 1} of ${totalSlides}`}
    >
      <CustomImage
        src={slide.image}
        alt={slide.alt || slide.title}
        className={styles.slideImage}
        priority={index === 0 || isCurrent}
        width={1920}
        height={90}
        quality={90}
        fallbackSrc="/images/placeholder.jpg"
      />
      <div className={styles.contentOverlay}>
        <div className={styles.contentContainer}>
          <div className={styles.textContent}>
            <h2 className={styles.title}>
              {slide.title}
            </h2>
            {slide.description && (
              <p className={styles.description}>
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