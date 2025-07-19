import * as React from 'react';
import { cn } from '@/lib/utils';

export interface Grid2Props extends React.HTMLAttributes<HTMLDivElement> {
  container?: boolean;
  item?: boolean;
  xs?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto' | 'full' | boolean;
  sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto' | 'full' | boolean;
  md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto' | 'full' | boolean;
  lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto' | 'full' | boolean;
  xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto' | 'full' | boolean;
  spacing?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  alignItems?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  wrap?: boolean | 'reverse';
}

export const Grid2 = React.forwardRef<HTMLDivElement, Grid2Props>(
  (
    {
      className,
      container,
      item,
      xs,
      sm,
      md,
      lg,
      xl,
      spacing = 4,
      direction,
      justify,
      alignItems,
      wrap,
      ...props
    },
    ref
  ) => {
    // Handle container styles
    const containerClasses = container
      ? cn(
          'grid',
          spacing !== 0 && `gap-${spacing}`,
          direction === 'row' && 'grid-flow-row',
          direction === 'row-reverse' && 'grid-flow-row-dense',
          direction === 'col' && 'grid-flow-col',
          direction === 'col-reverse' && 'grid-flow-col-dense',
          // Grid template columns
          'grid-cols-12'
        )
      : '';

    // Handle item styles
    const getColSpan = (value: Grid2Props['xs']) => {
      if (value === true) return 'col-span-12';
      if (value === 'auto') return 'col-auto';
      if (value === 'full') return 'col-span-full';
      return value ? `col-span-${value}` : '';
    };

    const itemClasses = item
      ? cn(
          // Column spans for different breakpoints
          getColSpan(xs),
          sm && (typeof sm === 'boolean' ? 'sm:col-span-12' : `sm:${getColSpan(sm)}`),
          md && (typeof md === 'boolean' ? 'md:col-span-12' : `md:${getColSpan(md)}`),
          lg && (typeof lg === 'boolean' ? 'lg:col-span-12' : `lg:${getColSpan(lg)}`),
          xl && (typeof xl === 'boolean' ? 'xl:col-span-12' : `xl:${getColSpan(xl)}`)
        )
      : '';

    // Handle flex container styles
    const flexContainerClasses = container
      ? cn(
          justify && `justify-${justify}`,
          alignItems && `items-${alignItems}`,
          wrap === true && 'flex-wrap',
          wrap === 'reverse' && 'flex-wrap-reverse'
        )
      : '';

    return (
      <div
        ref={ref}
        className={cn(containerClasses, itemClasses, flexContainerClasses, className)}
        {...props}
      />
    );
  }
);

Grid2.displayName = 'Grid2';

export default Grid2;
