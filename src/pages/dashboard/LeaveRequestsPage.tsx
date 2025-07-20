// @ts-ignore
import { DataTable } from '@/components/common/DataTable';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { getLeaveRequestColumns } from '@/components/leaveRequest/columns';
import LeaveRequestDialog from '@/components/leaveRequest/LeaveRequestDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useLoading } from '@/contexts/LoadingContext';
import { useAuth } from '@/hooks/useAuth';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useLeaveTypes } from '@/hooks/useLeaveTypes';
import { LeaveRequestFormValues } from '@/schemas/leaveRequest';
import { cancelLeaveRequest } from '@/services/leaveRequestService';
import { LeaveRequest } from '@/types/leaveRequest';
import { useQueryClient } from '@tanstack/react-query';
import { FileText, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { isAdmin } from '@/lib/jwt-utils';

const EmptyState = ({ onCreateClick }: { onCreateClick: () => void }) => (
  <Card className="flex h-[400px] flex-col items-center justify-center">
    <FileText className="h-12 w-12 text-muted-foreground/50" />
    <h3 className="mt-4 text-lg font-medium">No leave requests found</h3>
    <p className="text-sm text-muted-foreground">
      Create your first leave request to get started
    </p>
    <Button className="mt-4" onClick={onCreateClick}>
      <Plus className="mr-2 h-4 w-4" />
      Create Leave Request
    </Button>
  </Card>
);

const PageHeader = ({ onCreateClick, isAdmin }: { onCreateClick: () => void; isAdmin: boolean }) => (
  <div className="flex flex-col space-y-2">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isAdmin ? 'Leave Requests' : 'My Leave Requests'}
        </h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? 'Manage and approve employee leave requests'
            : 'View and manage your leave requests'
          }
        </p>
      </div>
      <Button onClick={onCreateClick}>
        <Plus className="mr-2 h-4 w-4" />
        Create Request
      </Button>
    </div>
  </div>
);

export default function LeaveRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const [approvalAction, setApprovalAction] = useState<{ approved: boolean; request: LeaveRequest } | null>(null);
  const [cancellationAction, setCancellationAction] = useState<{ cancel: boolean; request: LeaveRequest } | null>(null);
  const [deleteAction, setDeleteAction] = useState<LeaveRequest | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch data
  const {
    leaveRequests,
    myLeaveRequests,
    isLoading,
    isLoadingMyRequests,
    createRequest,
    deleteRequest,
    approveRequest,
    cancelRequest,
  } = useLeaveRequests();

  const { data: leaveTypes = [] } = useLeaveTypes();

  // Check if user is admin
  const isAdminUser = () => {
    return user?.roles ? isAdmin(user.roles) : false;
  };

  // Determine which data to use based on user role
  const allRequests = isAdminUser() ? (leaveRequests || []) : (myLeaveRequests || []);

  // Determine the correct loading state
  const isDataLoading = isAdminUser() ? isLoading : isLoadingMyRequests;



  // // Debug component for development
  // const DebugInfo = () => {
  //   if (import.meta.env.DEV) {
  //     return (
  //       <div className="mb-4 p-4 bg-gray-100 rounded-lg text-xs">
  //         <h4 className="font-bold mb-2">Debug Info (Development Only)</h4>
  //         <div>User Email: {user?.email}</div>
  //         <div>User Roles: {user?.roles?.join(', ')}</div>
  //         <div>Is Admin: {isAdminUser() ? 'Yes' : 'No'}</div>
  //         <div>Leave Requests Count: {leaveRequests?.length || 0}</div>
  //         <div>My Leave Requests Count: {myLeaveRequests?.length || 0}</div>
  //         <div>All Requests Count: {allRequests?.length || 0}</div>
  //         <div className="mt-2">
  //           <h5 className="font-semibold">Request Status Breakdown:</h5>
  //           {allRequests.map((req, index) => (
  //             <div key={index} className="ml-2">
  //               ID: {req.id?.substring(0, 8) || 'N/A'}... | 
  //               Approved: {req.approved === null ? 'null' : String(req.approved)} | 
  //               Cancelled: {String(req.cancelled || false)} | 
  //               Status: {
  //                 req.cancelled ? 'Cancelled' : 
  //                 req.approved === null ? 'Pending' : 
  //                 req.approved ? 'Approved' : 'Rejected'
  //               }
  //             </div>
  //           ))}
  //         </div>
  //       </div>
  //     );
  //   }
  //   return null;
  // };



  const handleDelete = useCallback(
    (request: LeaveRequest) => {
      setDeleteAction(request);
      setIsDeleteDialogOpen(true);
    },
    []
  );

  const handleApprove = useCallback(
    (request: LeaveRequest, approved: boolean) => {
      setApprovalAction({ approved, request });
      setIsApproveDialogOpen(true);
    },
    []
  );

  const handleCancel = useCallback(
    (request: LeaveRequest, cancel: boolean) => {
      setCancellationAction({ cancel, request });
      setIsCancelDialogOpen(true);
    },
    []
  );

  const handleApproveConfirm = useCallback(async () => {
    if (!approvalAction) return;
    try {
      await approveRequest.mutateAsync({ 
        id: approvalAction.request.id, 
        approved: approvalAction.approved 
      });
      setIsApproveDialogOpen(false);
      setApprovalAction(null);
    } catch (error) {
      // Error will be handled by the mutation
    }
  }, [approvalAction, approveRequest]);

  const handleCancelConfirm = useCallback(async () => {
    if (!cancellationAction) return;
    try {
      await cancelRequest.mutateAsync({ 
        id: cancellationAction.request.id, 
        cancel: cancellationAction.cancel 
      });
      setIsCancelDialogOpen(false);
      setCancellationAction(null);
    } catch (error) {
      // Error will be handled by the mutation
    }
  }, [cancellationAction, cancelRequest]);

  const handleCreateSubmit = useCallback(
    async (values: LeaveRequestFormValues) => {
      try {
        await createRequest.mutateAsync(values);
        setIsCreateDialogOpen(false);
      } catch (error) {
        throw error;
      }
    },
    [createRequest]
  );



  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteAction) return;
    try {
      await deleteRequest.mutateAsync(deleteAction.id);
      setIsDeleteDialogOpen(false);
      setDeleteAction(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete leave request',
      });
    }
  }, [deleteAction, deleteRequest, toast]);

  // Memoized columns
  const columns = useMemo(
    () =>
      getLeaveRequestColumns({
        onDelete: handleDelete,
        onApprove: handleApprove,
        onCancel: handleCancel,
        showActions: true,
        isAdmin: isAdminUser(),
        getCurrentUserId: () => user?.id || null,
      }),
    [handleDelete, handleApprove, handleCancel, isAdminUser, user?.id]
  );

  // Filterable columns
  const filterableColumns = useMemo(() => [
    {
      id: 'leaveTypeName',
      title: 'Leave Type',
      options: leaveTypes.map((type) => ({
        label: type.name,
        value: type.name,
      })),
    },
    {
      id: 'status',
      title: 'Status',
      options: [
        { label: 'Pending', value: 'Pending' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Cancelled', value: 'Cancelled' },
      ],
    },
  ], [leaveTypes]);

  return (
    <div className="container mx-auto space-y-6 py-6">
      <PageHeader onCreateClick={() => setIsCreateDialogOpen(true)} isAdmin={isAdminUser()} />
      
      {/* <DebugInfo /> */}

      {allRequests.length === 0 && !isDataLoading ? (
        <EmptyState onCreateClick={() => setIsCreateDialogOpen(true)} />
      ) : (
        <DataTable
          columns={columns}
          data={allRequests}
          isLoading={isDataLoading}
          searchPlaceholder="Search by leave type, comments, or employee name..."
          title={isAdminUser() ? 'Leave Requests' : 'My Leave Requests'}
          subtitle={
            isAdminUser()
              ? 'Manage and approve employee leave requests'
              : 'View and manage your leave requests'
          }
          filterableColumns={filterableColumns}
          actions={
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Request
            </Button>
          }
          initialSortColumn="dateCreated"
          initialSortDirection="desc"
          emptyMessage="No leave requests found. Create your first request to get started."
        />
      )}

      {/* Create Leave Request Dialog */}
      <LeaveRequestDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSubmit}
        leaveTypes={leaveTypes}
      />



      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Leave Request"
        description="Are you sure you want to delete this leave request? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
      />

      {/* Approve/Reject Confirmation Dialog */}
      <ConfirmationDialog
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
        title={approvalAction?.approved ? "Approve Leave Request" : "Reject Leave Request"}
        description={
          approvalAction?.approved 
            ? `Are you sure you want to approve this leave request? This will allow the employee to take leave.`
            : `Are you sure you want to reject this leave request? This will deny the employee's leave request.`
        }
        onConfirm={handleApproveConfirm}
      />

      {/* Cancel/Uncancel Confirmation Dialog */}
      <ConfirmationDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        title={cancellationAction?.cancel ? "Cancel Leave Request" : "Uncancel Leave Request"}
        description={
          cancellationAction?.cancel 
            ? `Are you sure you want to cancel this leave request? This will prevent the employee from taking leave.`
            : `Are you sure you want to uncancel this leave request? This will allow the employee to take leave again.`
        }
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}
