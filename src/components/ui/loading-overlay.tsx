import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { LoadingSpinner, PulsingDots } from './loading-spinner';
import { cn } from '@/lib/utils';

const overlayVariants = cva(
  'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity',
  {
    variants: {
      variant: {
        default: 'bg-background/80',
        subtle: 'bg-background/50',
        transparent: 'bg-transparent',
      },
      position: {
        default: 'inset-0',
        top: 'inset-x-0 top-0 h-16',
        bottom: 'inset-x-0 bottom-0 h-16',
      },
    },
    defaultVariants: {
      variant: 'default',
      position: 'default',
    },
  }
);

export interface LoadingOverlayProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof overlayVariants> {
  isLoading: boolean;
  text?: string;
  spinnerSize?: 'sm' | 'default' | 'lg' | 'xl' | '2xl';
  spinnerVariant?: 'default' | 'muted' | 'inverted';
  showSpinner?: boolean;
  showPulsingDots?: boolean;
}

export function LoadingOverlay({
  isLoading,
  text,
  spinnerSize = 'lg',
  spinnerVariant = 'default',
  variant,
  position,
  className,
  showSpinner = true,
  showPulsingDots = false,
  ...props
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        overlayVariants({ variant, position }),
        'duration-200 animate-in fade-in',
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-3 rounded-lg bg-background p-6 shadow-lg">
        {showSpinner && <LoadingSpinner size={spinnerSize} variant={spinnerVariant} />}
        {showPulsingDots && <PulsingDots className="text-primary" />}
        {text && <p className="text-center text-sm font-medium text-muted-foreground">{text}</p>}
      </div>
    </div>
  );
}
