import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * The target ID to skip to
   */
  targetId: string;
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * SkipLink component provides a way for keyboard users to bypass navigation
 * and jump directly to the main content. It's visually hidden until focused.
 */
export function SkipLink({
  targetId,
  children = 'Skip to content',
  className,
  ...props
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        'absolute left-4 top-4 z-50 -translate-y-full transform rounded-md bg-background px-4 py-2 text-sm font-medium opacity-0 shadow-md transition-transform focus:translate-y-0 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}
