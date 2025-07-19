import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Row } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Trash2, Eye, CalendarCheck } from 'lucide-react';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  onView?: (row: TData) => void;
}

export function DataTableRowActions<TData>({
  row,
  onEdit,
  onDelete,
  onView,
}: DataTableRowActionsProps<TData>) {
  const navigate = useNavigate();

  // Check if this is an employee row with an id property
  const hasId = row.original && typeof row.original === 'object' && 'id' in row.original;

  const viewLeaveBalance = () => {
    try {
      if (hasId) {
        const id = (row.original as any).id;
        navigate(`/dashboard/leave-balance/${id}`);
      }
    } catch (error) {
      console.error('Error navigating to leave balance:', error);
    }
  };

  const handleEdit = () => {
    try {
      if (onEdit && row.original) {
        onEdit(row.original);
      }
    } catch (error) {
      console.error('Error handling edit:', error);
    }
  };

  const handleDelete = () => {
    try {
      if (onDelete && row.original) {
        onDelete(row.original);
      }
    } catch (error) {
      console.error('Error handling delete:', error);
    }
  };

  const handleView = () => {
    try {
      if (onView && row.original) {
        onView(row.original);
      }
    } catch (error) {
      console.error('Error handling view:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {onView && (
          <DropdownMenuItem onClick={handleView}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {hasId && (
          <DropdownMenuItem onClick={viewLeaveBalance}>
            <CalendarCheck className="mr-2 h-4 w-4" />
            Leave Balance
          </DropdownMenuItem>
        )}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
