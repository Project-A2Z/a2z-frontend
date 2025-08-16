'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  priority?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  fallbackSrc?: string;
  fill?: boolean;
  onClick?: () => void;
}

export function CustomImage({
  src,
  alt,
  width = 0,
  height = 0,
  className = '',
  objectFit = 'cover',
  priority = false,
  rounded = 'none',
  fallbackSrc = '/images/placeholder.jpg',
  fill = false,
  onClick,
  ...props
}: ImageProps & React.ComponentPropsWithoutRef<typeof Image>) {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    setImgSrc(src);
    setError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    setError(true);
    if (fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const roundedClasses = {
    'none': '',
    'sm': 'rounded-sm',
    'md': 'rounded-md',
    'lg': 'rounded-lg',
    'full': 'rounded-full'
  };

  return (
    <div 
      className={cn(
        'relative overflow-hidden',
        roundedClasses[rounded],
        fill ? 'w-full h-full' : '',
        className
      )}
      onClick={onClick}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600"></div>
        </div>
      )}
      
      <Image
        src={imgSrc}
        alt={alt}
        width={!fill ? width || undefined : undefined}
        height={!fill ? height || undefined : undefined}
        fill={fill}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        className={cn(
          'transition-opacity duration-300',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'fill' && 'object-fill',
          objectFit === 'none' && 'object-none',
          objectFit === 'scale-down' && 'object-scale-down',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        {...(priority ? { loading: undefined } : {})}
        {...Object.fromEntries(
          Object.entries(props).filter(([key]) => 
            !['priority', 'loading'].includes(key)
          )
        )}
      />
      
      {error && !fallbackSrc && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
          <svg
            className="h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Image failed to load</p>
        </div>
      )}
    </div>
  );
}