import * as React from 'react';
import { useId } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, AlertCircle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { Label } from './label';

const formFieldVariants = cva(
  'group relative w-full rounded-md border border-input bg-transparent transition-all focus-within:ring-1 focus-within:ring-ring',
  {
    variants: {
      variant: {
        default: '',
        filled: 'bg-muted/50 border-muted',
        outline: 'border-2',
      },
      state: {
        default: '',
        error: 'border-destructive focus-within:ring-destructive',
        success: 'border-success focus-within:ring-success',
      },
      size: {
        default: 'h-14',
        sm: 'h-12',
        lg: 'h-16',
      },
    },
    defaultVariants: {
      variant: 'default',
      state: 'default',
      size: 'default',
    },
  }
);

export interface EnhancedFormFieldProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formFieldVariants> {
  asChild?: boolean;
  label: string;
  description?: string;
  error?: string;
  success?: string;
  required?: boolean;
  optional?: boolean;
  icon?: React.ReactNode;
}

const EnhancedFormField = React.forwardRef<HTMLDivElement, EnhancedFormFieldProps>(
  (
    {
      className,
      variant,
      state = 'default',
      size,
      asChild = false,
      label,
      description,
      error,
      success,
      required,
      optional,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'div';
    const id = useId();
    const hasError = !!error || state === 'error';
    const hasSuccess = !!success || state === 'success';
    const hasIcon = !!icon;
    const hasMessage = !!error || !!success || !!description;

    // Determine the state based on error/success props
    const fieldState = hasError ? 'error' : hasSuccess ? 'success' : state;

    return (
      <div className="w-full space-y-1">
        <Comp
          ref={ref}
          className={cn(formFieldVariants({ variant, state: fieldState, size, className }))}
          {...props}
        >
          {hasIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <div className={cn('flex flex-col px-3 py-2', hasIcon && 'pl-10')}>
            <Label
              htmlFor={id}
              className={cn(
                'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground transition-all group-focus-within:left-3 group-focus-within:top-2 group-focus-within:translate-y-0 group-focus-within:text-xs group-focus-within:text-foreground group-[:has([data-filled])]:left-3 group-[:has([data-filled])]:top-2 group-[:has([data-filled])]:translate-y-0 group-[:has([data-filled])]:text-xs',
                hasIcon && 'left-10 group-focus-within:left-10 group-[:has([data-filled])]:left-10',
                hasError && 'text-destructive group-focus-within:text-destructive',
                hasSuccess && 'text-success group-focus-within:text-success'
              )}
            >
              {label}
              {required && <span className="ml-1 text-destructive">*</span>}
              {optional && <span className="ml-1 text-xs text-muted-foreground">(Optional)</span>}
            </Label>
            <div className="mt-4">{children}</div>
          </div>
          {hasSuccess && (
            <div className="text-success absolute right-3 top-1/2 -translate-y-1/2">
              <Check className="h-4 w-4" />
            </div>
          )}
        </Comp>
        <AnimatePresence>
          {hasMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-1"
            >
              {error && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  <span>{error}</span>
                </div>
              )}
              {!error && success && (
                <div className="text-success flex items-center gap-1 text-xs">
                  <Check className="h-3 w-3" />
                  <span>{success}</span>
                </div>
              )}
              {!error && !success && description && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Info className="h-3 w-3" />
                  <span>{description}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
EnhancedFormField.displayName = 'EnhancedFormField';

export { EnhancedFormField };
