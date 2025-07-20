// @ts-ignore
import * as React from 'react';
import { X, Search, Filter, ChevronDown } from 'lucide-react';

import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu';

interface DataTableToolbarProps<TData> {
  table: any;
  filterableColumns?: {
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
}

export function DataTableToolbar<TData>({
  table,
  filterableColumns = [],
  globalFilter,
  setGlobalFilter,
  searchPlaceholder = 'Search...',
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || globalFilter !== '';

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8"
          />
          {globalFilter && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setGlobalFilter('')}
            >
              <X className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        {filterableColumns.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
                {isFiltered && (
                  <Badge variant="secondary" className="ml-1 rounded-sm px-1 font-normal">
                    {table.getState().columnFilters.length + (globalFilter !== '' ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {filterableColumns.map((column) => (
                <DropdownMenu key={column.id}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex w-full justify-between px-2 py-1.5 text-sm"
                    >
                      {column.title}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {column.options.map((option) => (
                      <DropdownMenuCheckboxItem
                        key={option.value}
                        checked={table
                          .getColumn(column.id)
                          ?.getFilterValue()
                          ?.includes(option.value)}
                        onCheckedChange={(checked) => {
                          const filterValues = table.getColumn(column.id)?.getFilterValue() || [];
                          if (checked) {
                            table
                              .getColumn(column.id)
                              ?.setFilterValue([...filterValues, option.value]);
                          } else {
                            table
                              .getColumn(column.id)
                              ?.setFilterValue(
                                filterValues.filter((value: string) => value !== option.value)
                              );
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {option.icon && option.icon}
                          <span>{option.label}</span>
                        </div>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
              {isFiltered && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex w-full justify-center"
                  onClick={() => {
                    table.resetColumnFilters();
                    setGlobalFilter('');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
