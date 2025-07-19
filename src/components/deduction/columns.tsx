import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Deduction } from '@/types/deduction';
import { formatDate } from '@/lib/utils';

interface DeductionColumnsProps {
  onEdit: (deduction: Deduction) => void;
  onDelete: (id: string) => void;
}

export const getDeductionColumns = ({
  onEdit,
  onDelete,
}: DeductionColumnsProps): ColumnDef<Deduction>[] => [
  {
    id: 'typeName',
    accessorKey: 'typeName',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('typeName') as string;
      return <div className="font-medium">{type}</div>;
    },
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.getValue('description') as string;
      return <div className="text-muted-foreground">{description || '-'}</div>;
    },
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      return (
        <div className="text-right font-medium tabular-nums">
          Rs{' '}
          {amount.toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          })}
        </div>
      );
    },
    meta: {
      isNumeric: true,
    },
  },
  {
    id: 'effectiveDate',
    accessorKey: 'effectiveDate',
    header: 'Effective Date',
    cell: ({ row }) => (
      <div className="font-medium">{formatDate(row.getValue('effectiveDate'))}</div>
    ),
  },
  {
    id: 'modifiedAt',
    accessorKey: 'modifiedAt',
    header: 'Modified At',
    cell: ({ row }) => <div className="font-medium">{formatDate(row.getValue('modifiedAt'))}</div>,
  },
  {
    id: 'employee',
    accessorKey: 'employee',
    header: 'Employee',
    cell: ({ row }) => {
      const employee = row.getValue('employee') as Deduction['employee'];
      // If employee object is available, use firstName and lastName
      if (employee && employee.firstName && employee.lastName) {
        return (
          <div className="font-medium">
            {employee.firstName} {employee.lastName}
          </div>
        );
      }
      // If no employee object, show employeeId as fallback
      const employeeId = row.original.employeeId;
      return <div className="font-medium text-muted-foreground">{employeeId || 'N/A'}</div>;
    },
  },
  {
    id: 'remarks',
    accessorKey: 'remarks',
    header: 'Remarks',
    cell: ({ row }) => {
      const remarks = row.getValue('remarks') as string;
      return <div className="text-muted-foreground">{remarks || '-'}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const deduction = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(deduction)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(deduction.id)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Keep the old export for backward compatibility
export const columns = getDeductionColumns({
  onEdit: () => {},
  onDelete: () => {},
});
