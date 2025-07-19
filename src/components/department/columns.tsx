import { ColumnDef } from '@tanstack/react-table';
import { Department } from '@/types/department';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DepartmentColumnsProps {
  onEdit: (department: Department) => void;
  onDelete: (id: string) => void;
}

export const columns = ({ onEdit, onDelete }: DepartmentColumnsProps): ColumnDef<Department>[] => [
  {
    accessorKey: 'departmentName',
    header: 'Name',
  },
  {
    accessorKey: 'headOfDepartment',
    header: 'Head of Department',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const department = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(department)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(department.id)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
