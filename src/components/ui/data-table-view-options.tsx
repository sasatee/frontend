import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Button } from './button';
import { SlidersHorizontal } from 'lucide-react';

interface DataTableViewOptionsProps<TData> {
  table: any;
}

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
  if (!table) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">View</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column: any) => {
            try {
              return typeof column.accessorFn !== 'undefined' && column.getCanHide();
            } catch (error) {
              console.error('Error filtering column:', error);
              return false;
            }
          })
          .map((column: any) => {
            try {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => {
                    try {
                      column.toggleVisibility(!!value);
                    } catch (error) {
                      console.error('Error toggling column visibility:', error);
                    }
                  }}
                >
                  {column.id.replace(/([A-Z])/g, ' $1').trim()}
                </DropdownMenuCheckboxItem>
              );
            } catch (error) {
              console.error('Error rendering column option:', error);
              return null;
            }
          })}
        <DropdownMenuSeparator />
        <div className="flex justify-between px-2 py-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="px-2 text-xs"
            onClick={() => {
              try {
                table.toggleAllColumnsVisible(true);
              } catch (error) {
                console.error('Error showing all columns:', error);
              }
            }}
          >
            Show all
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 text-xs"
            onClick={() => {
              try {
                table.toggleAllColumnsVisible(false);
              } catch (error) {
                console.error('Error hiding all columns:', error);
              }
            }}
          >
            Hide all
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
