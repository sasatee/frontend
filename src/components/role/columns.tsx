import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Role } from '@/services/roleService';
import { Badge } from '@/components/ui/badge';

interface RoleColumnProps {
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export const getRoleColumns = ({ onEdit, onDelete }: RoleColumnProps): ColumnDef<Role>[] => [
  {
    accessorKey: 'name',
    header: 'Role Name',
    cell: ({ row }) => {
      const role = row.original;
      return <div className="font-medium">{role.name}</div>;
    },
  },
  {
    accessorKey: 'totalUsers',
    header: 'Users',
    cell: ({ row }) => {
      const totalUsers = row.original.totalUsers || 0;
      return (
        <div className="flex items-center">
          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className="font-normal">
            {totalUsers}
          </Badge>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const role = row.original;

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem
                onClick={() => onEdit(role)}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Role
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(role)}
                className="flex cursor-pointer items-center gap-2 text-sm text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
