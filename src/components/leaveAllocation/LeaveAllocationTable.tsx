import React from 'react';
import { useLeaveAllocations } from '../../hooks/useLeaveAllocations';
import { useEmployees } from '../../hooks/useEmployees';
import { useLeaveTypes } from '../../hooks/useLeaveTypes';
import { LeaveAllocation } from '../../types/leaveAllocation';
import { DataTable } from '../common/DataTable';
import { DataTableColumnHeader } from '../ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

interface Props {
  onDelete: (allocation: LeaveAllocation) => void;
}

const LeaveAllocationTable: React.FC<Props> = ({ onDelete }) => {
  const { data: allocations, isLoading, isError } = useLeaveAllocations();
  const { data: employees } = useEmployees();
  const { data: leaveTypes } = useLeaveTypes();

  // Map for fast lookup
  const employeeMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    employees?.forEach((emp) => {
      map[emp.id] = `${emp.firstName} ${emp.lastName}`;
    });
    return map;
  }, [employees]);

  const leaveTypeMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    leaveTypes?.forEach((type) => {
      map[type.id] = type.name;
    });
    return map;
  }, [leaveTypes]);

  const columns = React.useMemo<ColumnDef<LeaveAllocation>[]>(
    () => [
      {
        accessorKey: 'leaveTypeId',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Leave Type" />,
        cell: ({ row }) => leaveTypeMap[row.original.leaveTypeId] || 'Unknown',
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'employeeId',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
        cell: ({ row }) => employeeMap[row.original.employeeId] || 'Unknown',
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'period',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Period" />,
        cell: ({ row }) => row.original.period,
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'numberOfDays',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Number of Days" />,
        cell: ({ row }) => row.original.numberOfDays,
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'dateCreated',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date Created" />,
        cell: ({ row }) =>
          row.original.dateCreated
            ? format(new Date(row.original.dateCreated), 'MMM d, yyyy')
            : 'N/A',
        enableSorting: true,
        enableHiding: true,
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDelete(row.original)} className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [employeeMap, leaveTypeMap, onDelete]
  );

  return (
    <DataTable
      columns={columns}
      data={allocations || []}
      isLoading={isLoading}
      emptyMessage={isError ? 'Error loading leave allocations.' : 'No leave allocations found.'}
      searchPlaceholder="Search leave allocations..."
      title="Leave Allocations"
      pagination
      filterableColumns={[
        {
          id: 'leaveTypeId',
          title: 'Leave Type',
          options: leaveTypes?.map((type) => ({ label: type.name, value: type.id })) || [],
        },
        {
          id: 'employeeId',
          title: 'Employee',
          options:
            employees?.map((emp) => ({
              label: `${emp.firstName} ${emp.lastName}`,
              value: emp.id,
            })) || [],
        },
        {
          id: 'period',
          title: 'Period',
          options: Array.from(new Set((allocations || []).map((a) => a.period))).map((period) => ({
            label: period.toString(),
            value: period.toString(),
          })),
        },
      ]}
    />
  );
};

export default LeaveAllocationTable;
