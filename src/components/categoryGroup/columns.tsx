import { ColumnDef } from '@tanstack/react-table';
import { FolderTree, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CategoryGroup } from '@/types/categoryGroup';

interface CategoryGroupColumnsProps {
  onEdit: (categoryGroup: CategoryGroup) => void;
  onDelete: (id: string) => void;
}

export const getCategoryGroupColumns = ({
  onEdit,
  onDelete,
}: CategoryGroupColumnsProps): ColumnDef<CategoryGroup>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const name: string = row.getValue('name');
      return (
        <div className="flex items-center gap-2">
          <FolderTree className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{name}</span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const categoryGroup = row.original;

      return (
        <div className="text-right">
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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(categoryGroup.id)}>
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(categoryGroup)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(categoryGroup.id)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
