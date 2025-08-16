import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// Button variants based on A2Z design system
export type ButtonVariant = 
  | 'primary'      // Main brand color (#88BE46)
  | 'secondary'    // Secondary brand color (#4C9343)
  | 'accent'       // Accent color (#06B590)
  | 'outline'      // Outlined style
  | 'ghost'        // Transparent background
  | 'danger'       // Error/danger state
  | 'success'      // Success state
  | 'warning';     // Warning state

// Button sizes
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Button states
export type ButtonState = 'default' | 'loading' | 'disabled' | 'success';

// Button props interface
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  state?: ButtonState;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

// Button component with forwardRef for accessibility
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      state = 'default',
      leftIcon,
      rightIcon,
      fullWidth = false,
      rounded = false,
      loadingText,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Determine if button should be disabled
    const isDisabled = disabled || state === 'disabled' || state === 'loading';

    // Base button classes
    const baseClasses = [
      'inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transform active:scale-95',
    ];

    // Variant-specific classes
    const variantClasses = {
      primary: [
        'bg-primary-500 hover:bg-primary-600 text-white',
        'focus:ring-primary-500 shadow-brand hover:shadow-brand-lg',
        'hover:-translate-y-0.5',
      ],
      secondary: [
        'bg-secondary-500 hover:bg-secondary-600 text-white',
        'focus:ring-secondary-500 shadow-brand hover:shadow-brand-lg',
        'hover:-translate-y-0.5',
      ],
      accent: [
        'bg-accent-500 hover:bg-accent-600 text-white',
        'focus:ring-accent-500 shadow-brand hover:shadow-brand-lg',
        'hover:-translate-y-0.5',
      ],
      outline: [
        'border-2 border-primary-500 text-primary-500',
        'hover:bg-primary-500 hover:text-white',
        'focus:ring-primary-500 hover:shadow-brand',
        'transition-colors duration-200',
      ],
      ghost: [
        'text-primary-500 hover:bg-primary-50',
        'focus:ring-primary-500',
        'hover:text-primary-600',
      ],
      danger: [
        'bg-error-500 hover:bg-error-600 text-white',
        'focus:ring-error-500 shadow-brand hover:shadow-brand-lg',
        'hover:-translate-y-0.5',
      ],
      success: [
        'bg-success-500 hover:bg-success-600 text-white',
        'focus:ring-success-500 shadow-brand hover:shadow-brand-lg',
        'hover:-translate-y-0.5',
      ],
      warning: [
        'bg-warning-500 hover:bg-warning-600 text-white',
        'focus:ring-warning-500 shadow-brand hover:shadow-brand-lg',
        'hover:-translate-y-0.5',
      ],
    };

    // Size-specific classes
    const sizeClasses = {
      xs: 'px-2 py-1 text-xs rounded',
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-lg',
      lg: 'px-6 py-3 text-base rounded-lg',
      xl: 'px-8 py-4 text-lg rounded-xl',
    };

    // State-specific classes
    const stateClasses = {
      default: '',
      loading: 'cursor-wait',
      disabled: 'cursor-not-allowed opacity-50',
      success: 'bg-success-500 hover:bg-success-600',
    };

    // Width and border radius classes
    const widthClasses = fullWidth ? 'w-full' : '';
    const radiusClasses = rounded ? 'rounded-full' : '';

    // Combine all classes
    const buttonClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      stateClasses[state],
      widthClasses,
      radiusClasses,
      className
    );

    // Loading spinner component
    const LoadingSpinner = () => (
      <div className="loading-spinner w-4 h-4 mr-2" />
    );

    // Success checkmark icon
    const SuccessIcon = () => (
      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    );

    // Render button content based on state
    const renderContent = () => {
      if (state === 'loading') {
        return (
          <>
            <LoadingSpinner />
            {loadingText || children}
          </>
        );
      }

      if (state === 'success') {
        return (
          <>
            <SuccessIcon />
            {children}
          </>
        );
      }

      return (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      );
    };

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        {...props}
      >
        {renderContent()}
      </button>
    );
  }
);

// Set display name for debugging
Button.displayName = 'Button';

// Pre-configured button variants for easy use
export const ButtonVariants = {
  Primary: (props: Omit<ButtonProps, 'variant'>) => <Button variant="primary" {...props} />,
  Secondary: (props: Omit<ButtonProps, 'variant'>) => <Button variant="secondary" {...props} />,
  Accent: (props: Omit<ButtonProps, 'variant'>) => <Button variant="accent" {...props} />,
  Outline: (props: Omit<ButtonProps, 'variant'>) => <Button variant="outline" {...props} />,
  Ghost: (props: Omit<ButtonProps, 'variant'>) => <Button variant="ghost" {...props} />,
  Danger: (props: Omit<ButtonProps, 'variant'>) => <Button variant="danger" {...props} />,
  Success: (props: Omit<ButtonProps, 'variant'>) => <Button variant="success" {...props} />,
  Warning: (props: Omit<ButtonProps, 'variant'>) => <Button variant="warning" {...props} />,
};

// Pre-configured button sizes for easy use
export const ButtonSizes = {
  ExtraSmall: (props: Omit<ButtonProps, 'size'>) => <Button size="xs" {...props} />,
  Small: (props: Omit<ButtonProps, 'size'>) => <Button size="sm" {...props} />,
  Medium: (props: Omit<ButtonProps, 'size'>) => <Button size="md" {...props} />,
  Large: (props: Omit<ButtonProps, 'size'>) => <Button size="lg" {...props} />,
  ExtraLarge: (props: Omit<ButtonProps, 'size'>) => <Button size="xl" {...props} />,
};

// Specialized button components
export const IconButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'children'> & { icon: React.ReactNode }>(
  ({ icon, size = 'md', className, ...props }, ref) => {
    const iconSizeClasses = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16',
    };

    return (
      <Button
        ref={ref}
        size={size}
        className={cn('p-0', iconSizeClasses[size], className)}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

// Loading button component
export const LoadingButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'state'> & { loadingText?: string }>(
  ({ loadingText, children, ...props }, ref) => (
    <Button ref={ref} state="loading" loadingText={loadingText} {...props}>
      {children}
    </Button>
  )
);

LoadingButton.displayName = 'LoadingButton';

// Success button component
export const SuccessButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'state'>>(
  (props, ref) => (
    <Button ref={ref} state="success" {...props} />
  )
);

SuccessButton.displayName = 'SuccessButton';


