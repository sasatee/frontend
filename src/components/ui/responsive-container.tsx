import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const containerVariants = cva('mx-auto w-full px-4 md:px-6 lg:px-8', {
  variants: {
    size: {
      default: 'max-w-7xl',
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      full: 'max-w-full',
    },
    padding: {
      default: 'py-4 md:py-6 lg:py-8',
      none: 'py-0',
      sm: 'py-2 md:py-3 lg:py-4',
      lg: 'py-6 md:py-8 lg:py-12',
      xl: 'py-8 md:py-12 lg:py-16',
    },
  },
  defaultVariants: {
    size: 'default',
    padding: 'default',
  },
});

export interface ResponsiveContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  as?: React.ElementType;
}

export function ResponsiveContainer({
  className,
  size,
  padding,
  as: Component = 'div',
  ...props
}: ResponsiveContainerProps) {
  return <Component className={cn(containerVariants({ size, padding }), className)} {...props} />;
}
