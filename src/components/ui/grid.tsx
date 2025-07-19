import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
      6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
      12: 'grid-cols-1 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-12',
      none: '',
    },
    gap: {
      default: 'gap-4',
      sm: 'gap-2',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-10',
      none: 'gap-0',
    },
    gapX: {
      default: 'gap-x-4',
      sm: 'gap-x-2',
      md: 'gap-x-6',
      lg: 'gap-x-8',
      xl: 'gap-x-10',
      none: 'gap-x-0',
    },
    gapY: {
      default: 'gap-y-4',
      sm: 'gap-y-2',
      md: 'gap-y-6',
      lg: 'gap-y-8',
      xl: 'gap-y-10',
      none: 'gap-y-0',
    },
    flow: {
      row: 'grid-flow-row',
      col: 'grid-flow-col',
      dense: 'grid-flow-dense',
      rowDense: 'grid-flow-row-dense',
      colDense: 'grid-flow-col-dense',
    },
  },
  defaultVariants: {
    cols: 1,
    gap: 'default',
  },
});

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

export function Grid({ className, cols, gap, gapX, gapY, flow, ...props }: GridProps) {
  return (
    <div className={cn(gridVariants({ cols, gap, gapX, gapY, flow }), className)} {...props} />
  );
}

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
  colStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto';
  colEnd?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 'auto';
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 'full';
  rowStart?: 1 | 2 | 3 | 4 | 5 | 6 | 'auto';
  rowEnd?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'auto';
}

export function GridItem({
  className,
  colSpan,
  colStart,
  colEnd,
  rowSpan,
  rowStart,
  rowEnd,
  ...props
}: GridItemProps) {
  return (
    <div
      className={cn(
        colSpan === 'full' && 'col-span-full',
        colSpan && colSpan !== 'full' && `col-span-${colSpan}`,
        colStart === 'auto' && 'col-start-auto',
        colStart && colStart !== 'auto' && `col-start-${colStart}`,
        colEnd === 'auto' && 'col-end-auto',
        colEnd && colEnd !== 'auto' && `col-end-${colEnd}`,
        rowSpan === 'full' && 'row-span-full',
        rowSpan && rowSpan !== 'full' && `row-span-${rowSpan}`,
        rowStart === 'auto' && 'row-start-auto',
        rowStart && rowStart !== 'auto' && `row-start-${rowStart}`,
        rowEnd === 'auto' && 'row-end-auto',
        rowEnd && rowEnd !== 'auto' && `row-end-${rowEnd}`,
        className
      )}
      {...props}
    />
  );
}
