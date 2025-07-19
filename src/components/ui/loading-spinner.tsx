import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const spinnerVariants = cva('inline-block text-current animate-spin', {
  variants: {
    size: {
      default: 'h-5 w-5',
      sm: 'h-4 w-4',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
      '2xl': 'h-12 w-12',
    },
    variant: {
      default: 'text-primary',
      muted: 'text-muted-foreground',
      inverted: 'text-primary-foreground',
    },
  },
  defaultVariants: {
    size: 'default',
    variant: 'default',
  },
});

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<SVGElement>,
    VariantProps<typeof spinnerVariants> {}

export function LoadingSpinner({ className, size, variant, ...props }: LoadingSpinnerProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(spinnerVariants({ size, variant }), className)}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export function PulsingDots({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center space-x-2', className)} {...props}>
      <div className="animation-delay-0 h-2 w-2 animate-pulse rounded-full bg-current" />
      <div className="animation-delay-200 h-2 w-2 animate-pulse rounded-full bg-current" />
      <div className="animation-delay-400 h-2 w-2 animate-pulse rounded-full bg-current" />
    </div>
  );
}

export function ProgressCircle({
  className,
  value = 0,
  size = 40,
  strokeWidth = 4,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value?: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dash = (value / 100) * circumference;

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }} {...props}>
      <svg
        className="absolute inset-0 -rotate-90 transform"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-muted"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-primary transition-all duration-300 ease-in-out"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - dash}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
        {Math.round(value)}%
      </div>
    </div>
  );
}
