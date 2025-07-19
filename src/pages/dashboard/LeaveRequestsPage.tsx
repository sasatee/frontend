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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { withLoading } = useLoading();
  const { user } = useAuth();

  // Fetch data
  const {
    leaveRequests,
    myLeaveRequests,
    isLoading,
    createRequest,
    updateRequest,
    deleteRequest,
    approveRequest,
  } = useLeaveRequests();

  const { data: leaveTypes = [] } = useLeaveTypes();

  // Check if user is admin
  const isAdmin = () => {
    return user?.roles?.some((role) => role === 'Admin' || role === 'Manager') || false;
  };

  // Determine which data to use based on user role
  const allRequests = isAdmin() ? (leaveRequests || []) : (myLeaveRequests || []);

  // Handlers
  const handleEdit = useCallback(
    (request: LeaveRequest) => {
      setSelectedRequest(request);
      setIsEditDialogOpen(true);
    },
    []
  );

  const handleDelete = useCallback(
    (request: LeaveRequest) => {
      setSelectedRequest(request);
      setIsDeleteDialogOpen(true);
    },
    []
  );

  const handleApprove = useCallback(
    async (request: LeaveRequest, approved: boolean) => {
      try {
        await approveRequest.mutateAsync({ id: request.id, approved });
      } catch (error) {
        // Error will be handled by the mutation
      }
    },
    [approveRequest]
  );

  const handleCancel = useCallback(
    async (request: LeaveRequest, cancel: boolean) => {
      try {
        await cancelLeaveRequest(request.id, cancel);
        toast({
          title: 'Success',
          description: `Leave request ${cancel ? 'cancelled' : 'uncancelled'} successfully`,
        });
        // Refresh the data
        window.location.reload();
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to cancel leave request',
        });
      }
    },
    [toast]
  );

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

  const handleEditSubmit = useCallback(
    async (values: LeaveRequestFormValues) => {
      if (!selectedRequest) return;
      try {
        await updateRequest.mutateAsync({
          id: selectedRequest.id,
          data: values,
        });
        setIsEditDialogOpen(false);
      } catch (error) {
        throw error;
      }
    },
    [selectedRequest, updateRequest]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedRequest) return;
    try {
      await deleteRequest.mutateAsync(selectedRequest.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete leave request',
      });
    }
  }, [selectedRequest, deleteRequest, toast]);

  // Memoized columns
  const columns = useMemo(
    () =>
      getLeaveRequestColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onApprove: handleApprove,
        onCancel: handleCancel,
        showActions: true,
      }),
    [handleEdit, handleDelete, handleApprove, handleCancel]
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
      <PageHeader onCreateClick={() => setIsCreateDialogOpen(true)} isAdmin={isAdmin()} />

      {allRequests.length === 0 && !isLoading ? (
        <EmptyState onCreateClick={() => setIsCreateDialogOpen(true)} />
      ) : (
        <DataTable
          columns={columns}
          data={allRequests}
          isLoading={isLoading}
          searchPlaceholder="Search by leave type, comments, or employee name..."
          title={isAdmin() ? 'Leave Requests' : 'My Leave Requests'}
          subtitle={
            isAdmin()
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

      {/* Edit Leave Request Dialog */}
      <LeaveRequestDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleEditSubmit}
        leaveRequest={selectedRequest || undefined}
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
    </div>
  );
}
