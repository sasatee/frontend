// @ts-ignore
// @ts-ignore
import * as React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface DataTablePaginationProps<TData> {
  table: any;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  if (!table) {
    return null;
  }

  try {
    const tableState = table.getState();
    const pagination = tableState?.pagination || { pageSize: 10, pageIndex: 0 };

    return (
      <div className="flex w-full flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel()?.rows?.length || 0} of{' '}
          {table.getFilteredRowModel()?.rows?.length || 0} row(s) selected.
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">Rows per page</span>
            <Select
              value={`${pagination.pageSize}`}
              onValueChange={(value) => {
                try {
                  table.setPageSize(Number(value));
                } catch (error) {
                  console.error('Error setting page size:', error);
                }
              }}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue placeholder={pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-center text-sm font-medium">
            Page {pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                try {
                  table.setPageIndex(0);
                } catch (error) {
                  console.error('Error setting page index:', error);
                }
              }}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                try {
                  table.previousPage();
                } catch (error) {
                  console.error('Error going to previous page:', error);
                }
              }}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                try {
                  table.nextPage();
                } catch (error) {
                  console.error('Error going to next page:', error);
                }
              }}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                try {
                  table.setPageIndex(table.getPageCount() - 1);
                } catch (error) {
                  console.error('Error setting page index:', error);
                }
              }}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering pagination:', error);
    return (
      <div className="flex w-full items-center justify-center p-4">
        <span className="text-sm text-red-500">Error loading pagination</span>
      </div>
    );
  }
}
