import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Allowance } from '@/types/allowance';

interface EnrichedAllowance extends Omit<Allowance, 'employee'> {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface AllowanceColumnsProps {
  onEdit: (allowance: EnrichedAllowance) => void;
  onDelete: (allowance: EnrichedAllowance) => void;
}

export const columns = ({
  onEdit,
  onDelete,
}: AllowanceColumnsProps): ColumnDef<EnrichedAllowance>[] => [
  {
    accessorKey: 'typeName',
    header: 'Type',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      return `Rs ${amount.toLocaleString()}`;
    },
  },
  {
    accessorKey: 'effectiveDate',
    header: 'Effective Date',
    cell: ({ row }) => {
      const date = new Date(row.getValue('effectiveDate'));
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: 'remarks',
    header: 'Remarks',
  },
  {
    id: 'employee',
    header: 'Employee',
    cell: ({ row }) => {
      const allowance = row.original;
      if (allowance.employee && allowance.employee.firstName && allowance.employee.lastName) {
        return `${allowance.employee.firstName} ${allowance.employee.lastName}`;
      }
      return allowance.employeeId;
    },
  },
  {
    id: 'modifiedAt',
    header: 'Last Modified',
    cell: ({ row }) => {
      const allowance = row.original;
      if (allowance.modifiedAt) {
        const date = new Date(allowance.modifiedAt);
        return date.toLocaleDateString();
      }
      return '-';
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const allowance = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(allowance)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(allowance)} className="text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
