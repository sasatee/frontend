import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Employee } from '@/types/employee';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTableRowActions } from '@/components/ui/data-table-row-actions';
import { Checkbox } from '@/components/ui/checkbox';

interface EmployeeColumnProps {
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onView?: (employee: Employee) => void;
}

export const getEmployeeColumns = ({
  onEdit,
  onDelete,
  onView,
}: EmployeeColumnProps): ColumnDef<Employee>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      try {
        const employee = row.original;
        const initials =
          `${employee.firstName?.charAt(0) || ''}${employee.lastName?.charAt(0) || ''}`.toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border">
              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                {initials || 'N/A'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{`${employee.firstName || ''} ${employee.lastName || ''}`}</p>
              <p className="text-xs text-muted-foreground">{employee.email || 'No email'}</p>
            </div>
          </div>
        );
      } catch (error) {
        console.error('Error rendering name cell:', error);
        return <span className="text-red-500">Error</span>;
      }
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'contact',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
    cell: ({ row }) => {
      try {
        const employee = row.original;
        return (
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3 text-muted-foreground" />
              <span className="max-w-[180px] truncate">{employee.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span>{employee.phone || 'N/A'}</span>
            </div>
          </div>
        );
      } catch (error) {
        console.error('Error rendering contact cell:', error);
        return <span className="text-red-500">Error</span>;
      }
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'department',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
    cell: ({ row }) => {
      try {
        const employee = row.original;
        const department = employee.department;

        if (!department && employee.departmentId) {
          return (
            <Badge variant="outline" className="bg-muted font-normal">
              Loading...
            </Badge>
          );
        }

        if (!department) return <span className="text-sm text-muted-foreground">Not Assigned</span>;

        return (
          <Badge
            variant="outline"
            className={cn(
              'font-normal',
              department.departmentName === 'Unknown Department' ? 'bg-yellow-50' : ''
            )}
          >
            {department.departmentName || 'Unknown Department'}
          </Badge>
        );
      } catch (error) {
        console.error('Error rendering department cell:', error);
        return <span className="text-red-500">Error</span>;
      }
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      try {
        return value.includes(row.getValue(id));
      } catch (error) {
        console.error('Error filtering department:', error);
        return false;
      }
    },
  },
  {
    accessorKey: 'jobTitle',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Job Title" />,
    cell: ({ row }) => {
      try {
        const employee = row.original;
        const jobTitle = employee.jobTitle;

        if (!jobTitle && employee.jobTitleId) {
          return (
            <Badge variant="outline" className="bg-muted font-normal">
              Loading...
            </Badge>
          );
        }

        if (!jobTitle) return <span className="text-sm text-muted-foreground">Not Assigned</span>;

        return (
          <Badge
            variant="outline"
            className={cn(
              'font-normal',
              jobTitle.title === 'Unknown Job Title' ? 'bg-yellow-50' : ''
            )}
          >
            {jobTitle.title || 'Unknown Job Title'}
          </Badge>
        );
      } catch (error) {
        console.error('Error rendering job title cell:', error);
        return <span className="text-red-500">Error</span>;
      }
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      try {
        return value.includes(row.getValue(id));
      } catch (error) {
        console.error('Error filtering job title:', error);
        return false;
      }
    },
  },
  {
    accessorKey: 'categoryGroup',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => {
      try {
        const employee = row.original;
        const categoryGroup = employee.categoryGroup;

        if (!categoryGroup && employee.categoryGroupId) {
          return <div className="text-sm text-muted-foreground">Loading...</div>;
        }

        if (!categoryGroup && !employee.categoryGroupId) {
          return <span className="text-sm text-muted-foreground">Not Assigned</span>;
        }

        return (
          <Badge variant="outline" className="font-normal">
            {categoryGroup?.name || 'Unknown Category'}
          </Badge>
        );
      } catch (error) {
        console.error('Error rendering category group cell:', error);
        return <span className="text-red-500">Error</span>;
      }
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      try {
        return (
          <DataTableRowActions row={row} onEdit={onEdit} onDelete={onDelete} onView={onView} />
        );
      } catch (error) {
        console.error('Error rendering actions cell:', error);
        return <span className="text-red-500">Error</span>;
      }
    },
  },
];
