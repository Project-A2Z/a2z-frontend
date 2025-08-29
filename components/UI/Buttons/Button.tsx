import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// Button variants based on A2Z design system
export type ButtonVariant = 
  | 'primary'      // Main brand color (#4c9343)
  | 'secondary'    // Secondary brand color (#88be46)
  | 'accent'       // Accent color (#06b590)
  | 'outline'      // Outlined style
  | 'ghost'        // Transparent background
  | 'danger'       // Error/danger state
  | 'success'      // Success state
  | 'warning'      // Warning state
  | 'custom';      // Custom CSS variables style

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

    // Variant-specific classes using CSS custom properties
    const variantClasses = {
      primary: [
        'text-white shadow-md hover:shadow-lg',
        'hover:-translate-y-0.5 transition-all duration-200',
      ],
      secondary: [
        'text-white shadow-md hover:shadow-lg',
        'hover:-translate-y-0.5 transition-all duration-200',
      ],
      accent: [
        'text-white shadow-md hover:shadow-lg',
        'hover:-translate-y-0.5 transition-all duration-200',
      ],
      outline: [
        'border-2 bg-transparent',
        'transition-colors duration-200',
      ],
      ghost: [
        'bg-transparent',
        'transition-colors duration-200',
      ],
      danger: [
        'text-white shadow-md hover:shadow-lg',
        'hover:-translate-y-0.5 transition-all duration-200',
      ],
      success: [
        'bg-green-500 hover:bg-green-600 text-white',
        'focus:ring-green-500 shadow-md hover:shadow-lg',
        'hover:-translate-y-0.5',
      ],
      warning: [
        'bg-yellow-500 hover:bg-yellow-600 text-white',
        'focus:ring-yellow-500 shadow-md hover:shadow-lg',
        'hover:-translate-y-0.5',
      ],
      custom: [
        'border bg-transparent',
        'transition-colors duration-200',
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
      success: 'bg-green-500 hover:bg-green-600',
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

    // Custom inline styles for different variants
    const getVariantStyle = () => {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: 'var(--primary)',
            borderColor: 'var(--primary)',
          };
        case 'secondary':
          return {
            backgroundColor: 'var(--secondary1)',
            borderColor: 'var(--secondary1)',
          };
        case 'accent':
          return {
            backgroundColor: 'var(--secondary2)',
            borderColor: 'var(--secondary2)',
          };
        case 'outline':
          return {
            borderColor: 'var(--primary)',
            color: 'var(--primary)',
            backgroundColor: 'transparent',
          };
        case 'ghost':
          return {
            color: 'var(--primary)',
            backgroundColor: 'transparent',
          };
        case 'danger':
          return {
            backgroundColor: 'var(--error)',
            borderColor: 'var(--error)',
          };
        case 'custom':
          return {
            backgroundColor: 'var(--background)',
            color: 'var(--primary)',
            borderColor: 'var(--primary)',
          };
        default:
          return {};
      }
    };

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
          <span>{children}</span>
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      );
    };

    return (
      <button
        ref={ref}
        className={buttonClasses}
        style={getVariantStyle()}
        disabled={isDisabled}
        onMouseEnter={(e) => {
          if (!isDisabled && variant !== 'ghost' && variant !== 'outline') {
            const button = e.currentTarget;
            const originalBg = button.style.backgroundColor;
            // Create a slightly darker shade for hover
            if (variant === 'primary') {
              button.style.backgroundColor = '#3a6f33'; // Darker shade of primary
            } else if (variant === 'secondary') {
              button.style.backgroundColor = '#7aa83c'; // Darker shade of secondary1
            } else if (variant === 'accent') {
              button.style.backgroundColor = '#059669'; // Darker shade of secondary2
            } else if (variant === 'danger') {
              button.style.backgroundColor = '#c53030'; // Darker shade of error
            }
          }
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            const button = e.currentTarget;
            // Reset to original color
            Object.assign(button.style, getVariantStyle());
          }
        }}
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
  Custom: (props: Omit<ButtonProps, 'variant'>) => <Button variant="custom" {...props} />,
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