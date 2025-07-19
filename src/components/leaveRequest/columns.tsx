import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LeaveRequest } from '@/types/leaveRequest';
import { ColumnDef, Row } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Check, MoreHorizontal, Pencil, Trash2, X } from 'lucide-react';

interface LeaveRequestColumnProps {
  onEdit: (request: LeaveRequest) => void;
  onDelete: (request: LeaveRequest) => void;
  onApprove: (request: LeaveRequest, approved: boolean) => void;
  showActions?: boolean;
}

export const getLeaveRequestColumns = ({
  onEdit,
  onDelete,
  onApprove,
  showActions = true,
}: LeaveRequestColumnProps): ColumnDef<LeaveRequest>[] => [
    {
      id: 'leaveType',
      accessorKey: 'leaveTypeName',
      header: 'Leave Type',
      cell: ({ row }) => {
        const request = row.original;
        return <div className="font-medium">{request.leaveTypeName}</div>;
      },
    },
    {
      id: 'startDate',
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }) => {
        const request = row.original;
        return (
          <div className="font-medium">{format(new Date(request.startDate), 'MMM dd, yyyy')}</div>
        );
      },
    },
    {
      id: 'endDate',
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }) => {
        const request = row.original;
        return <div className="font-medium">{format(new Date(request.endDate), 'MMM dd, yyyy')}</div>;
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const request = row.original;
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
        let text = 'Pending';

        if (request.cancelled) {
          variant = 'destructive';
          text = 'Cancelled';
        } else if (request.approved) {
          variant = 'default';
          text = 'Approved';
        } else if (request.approved === false) {
          variant = 'destructive';
          text = 'Rejected';
        }

        return <Badge variant={variant}>{text}</Badge>;
      },
    },
    {
      id: 'comments',
      accessorKey: 'requestComments',
      header: 'Comments',
      cell: ({ row }) => {
        const request = row.original;
        return (
          <div className="max-w-[300px] truncate" title={request.requestComments}>
            {request.requestComments || '-'}
          </div>
        );
      },
    },
    ...(showActions
      ? [
        {
          id: 'actions',
          cell: ({ row }: { row: Row<LeaveRequest> }) => {
            const request = row.original;
            const isPending = !request.approved && !request.cancelled;

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
                    {isPending && (
                      <>
                        <DropdownMenuItem
                          onClick={() => onApprove(request, true)}
                          className="flex cursor-pointer items-center gap-2 text-sm text-green-600 focus:text-green-600"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onApprove(request, false)}
                          className="flex cursor-pointer items-center gap-2 text-sm text-red-600 focus:text-red-600"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => onEdit(request)}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(request)}
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
      ]
      : []),
  ];
