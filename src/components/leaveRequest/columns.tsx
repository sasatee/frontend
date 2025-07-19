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
  onDelete: (request: LeaveRequest) => void;
  onApprove: (request: LeaveRequest, approved: boolean) => void;
  onCancel: (request: LeaveRequest, cancel: boolean) => void;
  showActions?: boolean;
  isAdmin?: boolean;
  getCurrentUserId?: () => string | null;
}

export const getLeaveRequestColumns = ({
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
            const isApproved = request.approved === true && !request.cancelled;
            const isRejected = request.approved === false && !request.cancelled;
            const isCancelled = request.cancelled === true;
            const currentUserId = getCurrentUserId();
            const isOwnRequest = request.requestingEmployeeId === currentUserId;
            const isAdminUser = isAdmin;

            // Debug logging for development
            if (import.meta.env.DEV) {
              console.log('Request Debug:', {
                id: request.id,
                approved: request.approved,
                cancelled: request.cancelled,
                isPending,
                isApproved,
                isRejected,
                isCancelled,
                isAdminUser,
                showApprovalActions: isAdminUser && isPending
              });
            }

            return (
              <div className="flex items-center justify-end gap-2">
                {/* Status indicator for admins */}
                {isAdminUser && (
                  <div className="text-xs text-muted-foreground">
                    {isPending && "Pending"}
                    {isApproved && "Approved"}
                    {isRejected && "Rejected"}
                    {isCancelled && "Cancelled"}
                  </div>
                )}
                
                {/* Action availability indicator */}
                {isAdminUser && (
                  <div className="text-xs">
                    {isPending && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Approve/Reject/Cancel
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Approve/Reject
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Cancel
                      </span>
                    )}
                    {isCancelled && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Uncancel
                      </span>
                    )}
                  </div>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0"
                      title={isAdminUser ? "Click for admin actions" : "Click for actions"}
                    >
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    {/* Admin actions for pending requests */}
                    {isAdminUser && isPending && (
                      <>
                        <DropdownMenuItem
                          onClick={() => onApprove(request, true)}
                          className="flex cursor-pointer items-center gap-2 text-sm text-green-600 focus:text-green-600 hover:bg-green-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve Request
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onApprove(request, false)}
                          className="flex cursor-pointer items-center gap-2 text-sm text-red-600 focus:text-red-600 hover:bg-red-50"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject Request
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onCancel(request, true)}
                          className="flex cursor-pointer items-center gap-2 text-sm text-orange-600 focus:text-orange-600 hover:bg-orange-50"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Cancel Request
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {/* Admin actions for rejected requests - can approve or keep rejected */}
                    {isAdminUser && isRejected && (
                      <>
                        <DropdownMenuItem
                          onClick={() => onApprove(request, true)}
                          className="flex cursor-pointer items-center gap-2 text-sm text-green-600 focus:text-green-600 hover:bg-green-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve Request
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onApprove(request, false)}
                          className="flex cursor-pointer items-center gap-2 text-sm text-red-600 focus:text-red-600 hover:bg-red-50"
                        >
                          <X className="h-3.5 w-3.5" />
                          Keep Rejected
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {/* Admin actions for approved requests - can cancel */}
                    {isAdminUser && isApproved && (
                      <>
                        <DropdownMenuItem
                          onClick={() => onCancel(request, true)}
                          className="flex cursor-pointer items-center gap-2 text-sm text-orange-600 focus:text-orange-600 hover:bg-orange-50"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Cancel Request
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {/* Admin actions for rejected requests - can cancel */}
                    {isAdminUser && isRejected && (
                      <>
                        <DropdownMenuItem
                          onClick={() => onCancel(request, true)}
                          className="flex cursor-pointer items-center gap-2 text-sm text-orange-600 focus:text-orange-600 hover:bg-orange-50"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Cancel Request
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {/* Admin can uncancel cancelled requests */}
                    {isAdminUser && request.cancelled && (
                      <>
                        <DropdownMenuItem
                          onClick={() => onCancel(request, false)}
                          className="flex cursor-pointer items-center gap-2 text-sm text-green-600 focus:text-green-600 hover:bg-green-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Uncancel Request
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {/* Edit action - only for own requests or admins */}


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

                    {/* No actions available message */}
                    {!isAdminUser && !isOwnRequest && (
                      <DropdownMenuItem className="text-sm text-muted-foreground cursor-default">
                        No actions available
                      </DropdownMenuItem>
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
