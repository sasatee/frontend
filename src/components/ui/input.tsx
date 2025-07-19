import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
  {
    variants: {
      inputSize: {
        default: 'h-9',
        sm: 'h-8 px-2 text-xs',
        lg: 'h-10 px-4',
      },
      variant: {
        default: '',
        filled: 'bg-muted/50 border-muted focus-visible:bg-transparent',
        outline: 'border-2',
      },
      hasError: {
        true: 'border-destructive focus-visible:ring-destructive',
        false: '',
      },
    },
    defaultVariants: {
      inputSize: 'default',
      variant: 'default',
      hasError: false,
    },
  }
);

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  inputSize?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'filled' | 'outline';
  hasError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      inputSize = 'default',
      variant = 'default',
      hasError = false,
      icon,
      iconPosition = 'left',
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative w-full">
        {icon && iconPosition === 'left' && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            inputVariants({ inputSize, variant, hasError, className }),
            icon && iconPosition === 'left' && 'pl-9',
            icon && iconPosition === 'right' && 'pr-9'
          )}
          ref={ref}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            {icon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input, inputVariants };
