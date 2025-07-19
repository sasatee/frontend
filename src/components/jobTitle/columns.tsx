import { ColumnDef } from '@tanstack/react-table';
import { Briefcase, MoreHorizontal } from 'lucide-react';
import { JobTitle } from '@/types/jobTitle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface JobTitleColumnsProps {
  onEdit: (jobTitle: JobTitle) => void;
  onDelete: (id: string) => void;
}

export const getJobTitleColumns = ({
  onEdit,
  onDelete,
}: JobTitleColumnsProps): ColumnDef<JobTitle>[] => [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const title = row.getValue('title') as string;
      return (
        <div className="flex items-center space-x-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{title}</span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const jobTitle = row.original;

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
            <DropdownMenuItem onClick={() => onEdit(jobTitle)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(jobTitle.id)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
