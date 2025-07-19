import { ColumnDef } from '@tanstack/react-table';
import { PayrollResponse } from '@/services/payrollService';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { MoreHorizontal, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EnrichedPayrollResponse extends PayrollResponse {
  employeeName: string;
}

interface PayrollColumnsProps {
  onDelete: (id: string) => void;
}

export const getPayrollColumns = ({
  onDelete,
}: PayrollColumnsProps): ColumnDef<EnrichedPayrollResponse>[] => [
  {
    accessorKey: 'employeeName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
    cell: ({ row }) => {
      const employeeName = row.getValue('employeeName') as string;
      const payroll = row.original;

      // Show employee name, fallback to "Unknown Employee" if name is same as ID
      const displayName =
        employeeName && employeeName !== payroll.employeeId ? employeeName : 'Unknown Employee';

      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">{displayName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'basicSalary',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Basic Salary" />,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('basicSalary'));
      return (
        <div className="font-medium tabular-nums">
          Rs{' '}
          {amount.toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          })}
        </div>
      );
    },
  },
  {
    accessorKey: 'allowances',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total Allowance" />,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('allowances'));
      return (
        <div className="font-medium tabular-nums">
          Rs{' '}
          {amount.toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          })}
        </div>
      );
    },
  },
  {
    accessorKey: 'deductions',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total Deduction" />,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('deductions'));
      return (
        <div className="font-medium tabular-nums text-destructive">
          Rs{' '}
          {amount.toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          })}
        </div>
      );
    },
  },
  {
    accessorKey: 'netPay',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Net Salary" />,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('netPay'));
      return (
        <div className="font-medium tabular-nums text-success">
          Rs{' '}
          {amount.toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          })}
        </div>
      );
    },
  },
  {
    accessorKey: 'payDate',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Pay Date" />,
    cell: ({ row }) => formatDate(row.getValue('payDate')),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const payroll = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDelete(payroll.id)} className="text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
