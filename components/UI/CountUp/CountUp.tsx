"use client";
import React, { useRef, useEffect, useState } from 'react';

interface CountUpProps {
  to?: number;
  from?: number;
  direction?: 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
  separator?: string;
  startWhen?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
}

const CountUp: React.FC<CountUpProps> = ({
  to = 0,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  separator = '',
  startWhen = true,
  onStart,
  onEnd,
}) => {
  const [count, setCount] = useState(from);
  const [isAnimating, setIsAnimating] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!startWhen || isAnimating) return;

    const startAnimation = () => {
      setIsAnimating(true);
      if (onStart) onStart();

      const startValue = direction === 'down' ? to : from;
      const endValue = direction === 'down' ? from : to;
      const difference = endValue - startValue;
      const stepTime = (duration * 1000) / Math.abs(difference || 1);
      
      let currentValue = startValue;
      
      const timer = setInterval(() => {
        if (direction === 'up') {
          currentValue += 1;
          if (currentValue >= endValue) {
            currentValue = endValue;
            clearInterval(timer);
            setIsAnimating(false);
            if (onEnd) onEnd();
          }
        } else {
          currentValue -= 1;
          if (currentValue <= endValue) {
            currentValue = endValue;
            clearInterval(timer);
            setIsAnimating(false);
            if (onEnd) onEnd();
          }
        }
        setCount(currentValue);
      }, stepTime);

      return () => clearInterval(timer);
    };

    const timeoutId = setTimeout(startAnimation, delay);
    return () => clearTimeout(timeoutId);
  }, [from, to, direction, delay, duration, startWhen, isAnimating, onStart, onEnd]);

  const formatNumber = (num: number): string => {
    if (!separator) return num.toString();
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  };

  return (
    <span className={className} ref={elementRef}>
      {formatNumber(count)}
    </span>
  );
};

export default React.memo(CountUp);