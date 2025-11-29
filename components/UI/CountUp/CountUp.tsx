// components/UI/CountUp/CountUp.tsx
import React, { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  separator?: string;
  className?: string;
  direction?: 'up' | 'down';
}

const CountUp: React.FC<CountUpProps> = ({
  from = 0,
  to,
  duration = 1,
  separator = ',',
  className = '',
  direction = 'up'
}) => {
  const [count, setCount] = useState(from);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = Math.min((timestamp - startTimeRef.current) / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const currentCount = Math.floor(from + (to - from) * easeOutQuart);
      setCount(currentCount);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(to); // Ensure final value is exact
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [from, to, duration]);

  // Format number with separator
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  };

  return <span className={className}>{formatNumber(count)}</span>;
};

export default CountUp;