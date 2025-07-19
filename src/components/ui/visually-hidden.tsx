import * as React from 'react';
import { cn } from '@/lib/utils';

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

export function VisuallyHidden({ className, asChild = false, ...props }: VisuallyHiddenProps) {
  const Comp = asChild ? React.Fragment : 'span';
  return (
    <Comp
      className={cn(
        'absolute h-[1px] w-[1px] overflow-hidden whitespace-nowrap p-0',
        '-m-px border-0',
        'clip-rect-0',
        className
      )}
      {...props}
    />
  );
}
