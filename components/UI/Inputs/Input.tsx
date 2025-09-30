import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  onIconClick?: () => void;
  error?: boolean;
  iconPosition?: 'left' | 'right';
  readOnly?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, onIconClick, error, iconPosition = 'right', readOnly = false, ...props }, ref) => {
    const sidePadding = icon
      ? iconPosition === 'right'
        ? 'pr-12 pl-4'
        : 'pl-12 pr-4'
      : 'px-4';
    
    return (
      <div className="relative w-full">
        <input
          ref={ref}
          readOnly={readOnly}
          className={cn(
            'w-full h-[44px] rounded-[32px] border bg-card text-right py-3 appearance-none',
            sidePadding,
            'border-black16 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-all duration-200 placeholder-black37',
            error ? 'border-error focus:ring-error' : '',
            readOnly ? 'cursor-not-allowed opacity-60 bg-gray-50' : '',
            className
          )}
          {...props}
        />
        {icon && (
          <button
            type="button"
            onClick={onIconClick}
            className={cn(
              'absolute top-1/2 transform -translate-y-1/2 text-black37 hover:text-black60 transition-colors',
              iconPosition === 'right' ? 'right-4' : 'left-4'
            )}
          >
            {icon}
          </button>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;