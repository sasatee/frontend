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
import { Ban, Check, MoreHorizontal, Pencil, Trash2, X } from 'lucide-react';

interface LeaveRequestColumnProps {
  onEdit: (request: LeaveRequest) => void;
  onDelete: (request: LeaveRequest) => void;
  onApprove: (request: LeaveRequest, approved: boolean) => void;
  onCancel: (request: LeaveRequest, cancel: boolean) => void;
  showActions?: boolean;
  isAdmin?: boolean;
  getCurrentUserId?: () => string | null;
}

export const getLeaveRequestColumns = ({
  onEdit,
  onDelete,
  onApprove,
  onCancel,
  showActions = true,
  isAdmin = false,
  getCurrentUserId = () => null,
}: LeaveRequestColumnProps): ColumnDef<LeaveRequest>[] => {

  return [
    {
      id: 'leaveType',
      accessorKey: 'leaveTypeName',
      header: 'Leave Type',
      cell: ({ row }) => {
        const request = row.original;
        return <div className="font-medium">{request.leaveTypeName || 'Unknown'}</div>;
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
        return (
          <div className="font-medium">{format(new Date(request.endDate), 'MMM dd, yyyy')}</div>
        );
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
        } else if (request.approved === true) {
          variant = 'default';
          text = 'Approved';
        } else if (request.approved === false) {
          variant = 'destructive';
          text = 'Rejected';
        } else {
          variant = 'secondary';
          text = 'Pending';
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
            const isPending = request.approved === null && !request.cancelled;
            const currentUserId = getCurrentUserId();
            const isOwnRequest = request.requestingEmployeeId === currentUserId;
            const isAdminUser = isAdmin;

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
                    {/* Admin actions - only show for admins */}
                    {isAdminUser && isPending && (
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
                        <DropdownMenuItem
                          onClick={() => onCancel(request, true)}
                          className="flex cursor-pointer items-center gap-2 text-sm text-orange-600 focus:text-orange-600"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Cancel
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {/* Admin can uncancel cancelled requests */}
                    {isAdminUser && request.cancelled && (
                      <>
                        <DropdownMenuItem
                          onClick={() => onCancel(request, false)}
                          className="flex cursor-pointer items-center gap-2 text-sm text-green-600 focus:text-green-600"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Uncancel
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {/* Edit action - only for own requests or admins */}
                    {(isOwnRequest || isAdminUser) && (
                      <DropdownMenuItem
                        onClick={() => onEdit(request)}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </DropdownMenuItem>
                    )}

                    {/* Delete action - only for own requests or admins */}
                    {(isOwnRequest || isAdminUser) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(request)}
                          className="flex cursor-pointer items-center gap-2 text-sm text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          },
        },
      ]
      : []),
  ];
};
