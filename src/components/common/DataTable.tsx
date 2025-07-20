import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { DataTableViewOptions } from '@/components/ui/data-table-view-options';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
// @ts-ignore
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
  searchPlaceholder?: string;
  title?: string;
  subtitle?: string;
  filterableColumns?: {
    id: string;
    title: string;
    options: {
      label: string;
      value: string;
      icon?: React.ReactNode;
    }[];
  }[];
  actions?: React.ReactNode;
  emptyMessage?: string;
  pagination?: boolean;
  initialPageSize?: number;
  initialSortColumn?: string;
  initialSortDirection?: 'asc' | 'desc';
  tableOptions?: Record<string, unknown>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  onRowClick,
  searchPlaceholder = 'Search...',
  title,
  subtitle,
  filterableColumns = [],
  actions,
  emptyMessage = 'No results found.',
  pagination = true,
  initialPageSize = 10,
  initialSortColumn,
  initialSortDirection = 'asc',
  tableOptions = {},
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(
    initialSortColumn ? [{ id: initialSortColumn, desc: initialSortDirection === 'desc' }] : []
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  // Validate required props
  if (!columns || columns.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error: No columns defined</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!Array.isArray(data)) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error: Invalid data format</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Memoize table configuration
  const tableConfig = useMemo(
    () => ({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      state: {
        sorting,
        columnFilters,
        columnVisibility,
        rowSelection,
        globalFilter,
      },
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onColumnVisibilityChange: setColumnVisibility,
      onRowSelectionChange: setRowSelection,
      onGlobalFilterChange: setGlobalFilter,
      ...tableOptions,
    }),
    [
      data,
      columns,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      tableOptions,
    ]
  );

  const table = useReactTable(tableConfig);

  // Set initial page size
  useEffect(() => {
    try {
      if (table && table.setPageSize) {
        table.setPageSize(initialPageSize);
      }
    } catch (error) {
      console.error('Error setting page size:', error);
    }
  }, [table, initialPageSize]);

  // Memoize loading skeleton rows
  const loadingRows = useMemo(
    () =>
      Array.from({ length: initialPageSize }, (_, i) => (
        <TableRow key={`skeleton-${i}`}>
            // @ts-ignore
          {columns.map((column, index) => (
            <TableCell key={`skeleton-cell-${index}`}>
              <Skeleton className="h-6 w-full" />
            </TableCell>
          ))}
        </TableRow>
      )),
    [columns, initialPageSize]
  );

  // Memoize row click handler
  const handleRowClick = useCallback(
    (row: Row<TData>) => {
      try {
        if (onRowClick && row?.original) {
          onRowClick(row.original);
        }
      } catch (error) {
        console.error('Error handling row click:', error);
      }
    },
    [onRowClick]
  );

  return (
    <Card className="w-full">
      {title && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>{title}</CardTitle>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {actions}
        </CardHeader>
      )}
      <div className="p-4 pb-0">
        <CustomDataTableToolbar
          table={table}
          filterableColumns={filterableColumns}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          searchPlaceholder={searchPlaceholder}
        />
      </div>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-20rem)] rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    try {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      );
                    } catch (error) {
                      console.error('Error rendering header:', error);
                      return (
                        <TableHead key={header.id}>
                          <span className="text-red-500">Error</span>
                        </TableHead>
                      );
                    }
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                loadingRows
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  try {
                    return (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        className={cn(onRowClick && 'cursor-pointer hover:bg-muted/50')}
                        onClick={() => handleRowClick(row)}
                      >
                        {row.getVisibleCells().map((cell) => {
                          try {
                            return (
                              <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            );
                          } catch (error) {
                            console.error('Error rendering cell:', error);
                            return (
                              <TableCell key={cell.id}>
                                <span className="text-red-500">Error</span>
                              </TableCell>
                            );
                          }
                        })}
                      </TableRow>
                    );
                  } catch (error) {
                    console.error('Error rendering row:', error);
                    return (
                      <TableRow key={row.id}>
                        <TableCell
                          colSpan={columns.length}
                          className="h-12 text-center text-red-500"
                        >
                          Error rendering row
                        </TableCell>
                      </TableRow>
                    );
                  }
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
      {pagination && (
        <CardFooter className="border-t px-6 py-4">
          <DataTablePagination table={table} />
        </CardFooter>
      )}
    </Card>
  );
}

export function CustomDataTableToolbar({
  table,
  filterableColumns = [],
  globalFilter,
  setGlobalFilter,
  searchPlaceholder,
}: {
  table: any;
  filterableColumns: {
    id: string;
    title: string;
    options: {
      label: string;
      value: string;
      icon?: React.ReactNode;
    }[];
  }[];
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  searchPlaceholder?: string;
}) {
  if (!table) {
    return null;
  }

  const tableState = table.getState();
  const isFiltered = (tableState?.columnFilters?.length || 0) > 0 || globalFilter !== '';

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        {filterableColumns && filterableColumns.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
                {isFiltered && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {(tableState?.columnFilters?.length || 0) + (globalFilter !== '' ? 1 : 0)}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {filterableColumns.map((column) => {
                // Skip columns with undefined or invalid IDs
                if (!column || !column.id || typeof column.id !== 'string') {
                  console.warn('Invalid column in filterableColumns:', column);
                  return null;
                }

                const tableColumn = table.getColumn(column.id);
                if (!tableColumn) return null;

                return (
                  <div key={column.id} className="space-y-1">
                    <div className="px-2 py-1.5 text-sm font-medium">{column.title}</div>
                    {column.options &&
                      column.options.map((option) => {
                        const filterValue = tableColumn.getFilterValue() || [];
                        const isChecked = Array.isArray(filterValue)
                          ? filterValue.includes(option.value)
                          : filterValue === option.value;

                        return (
                          <DropdownMenuCheckboxItem
                            key={option.value}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              try {
                                const currentFilterValue = tableColumn.getFilterValue() || [];
                                if (checked) {
                                  const newValue = Array.isArray(currentFilterValue)
                                    ? [...currentFilterValue, option.value]
                                    : [option.value];
                                  tableColumn.setFilterValue(newValue);
                                } else {
                                  const newValue = Array.isArray(currentFilterValue)
                                    ? currentFilterValue.filter(
                                        (value: string) => value !== option.value
                                      )
                                    : [];
                                  tableColumn.setFilterValue(
                                    newValue.length > 0 ? newValue : undefined
                                  );
                                }
                              } catch (error) {
                                console.error('Error updating filter:', error);
                              }
                            }}
                          >
                            <div className="flex items-center gap-2">
                              {option.icon && option.icon}
                              <span>{option.label}</span>
                            </div>
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                  </div>
                );
              })}
              {isFiltered && (
                <div className="border-t pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex w-full justify-center"
                    onClick={() => {
                      try {
                        table.resetColumnFilters();
                        setGlobalFilter('');
                      } catch (error) {
                        console.error('Error clearing filters:', error);
                      }
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
