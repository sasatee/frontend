import * as React from 'react';
import { cn } from '@/lib/utils';

export interface KeyboardFocusProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  focusClassName?: string;
  tabIndex?: number;
  disabled?: boolean;
  onFocusEnter?: () => void;
  onFocusLeave?: () => void;
  onActivate?: () => void;
}

/**
 * KeyboardFocus component provides consistent keyboard focus styling and handling
 * It helps improve accessibility by providing visual focus indicators and keyboard navigation
 */
export function KeyboardFocus({
  children,
  className,
  focusClassName = 'outline-none ring-2 ring-ring ring-offset-2 ring-offset-background',
  tabIndex = 0,
  disabled = false,
  onFocusEnter,
  onFocusLeave,
  onActivate,
  ...props
}: KeyboardFocusProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  const handleFocus = React.useCallback(() => {
    if (!disabled) {
      setIsFocused(true);
      onFocusEnter?.();
    }
  }, [disabled, onFocusEnter]);

  const handleBlur = React.useCallback(() => {
    setIsFocused(false);
    onFocusLeave?.();
  }, [onFocusLeave]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onActivate?.();
      }
    },
    [disabled, onActivate]
  );

  return (
    <div
      className={cn(
        'transition-all',
        isFocused && focusClassName,
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      tabIndex={disabled ? -1 : tabIndex}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      role="button"
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </div>
  );
}
