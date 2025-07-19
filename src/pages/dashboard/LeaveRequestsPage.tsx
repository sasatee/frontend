import { DataTable } from '@/components/common/DataTable';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { getLeaveRequestColumns } from '@/components/leaveRequest/columns';
import LeaveRequestDialog from '@/components/leaveRequest/LeaveRequestDialog';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useLeaveTypes } from '@/hooks/useLeaveTypes';
import { LeaveRequestFormValues } from '@/schemas/leaveRequest';
import { cancelLeaveRequest } from '@/services/leaveRequestService';
import { LeaveRequest } from '@/types/leaveRequest';
import { Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

// Memoized empty state component
const EmptyState = ({ onCreateClick }: { onCreateClick: () => void }) => (
  <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
    <div className="text-center">
      <h3 className="text-lg font-medium">No leave requests found</h3>
      <p className="text-sm text-muted-foreground">Get started by creating a new leave request</p>
    </div>
    <Button onClick={onCreateClick}>
      <Plus className="mr-2 h-4 w-4" />
      New Leave Request
    </Button>
  </div>
);

// Memoized page header component
const PageHeader = ({ onCreateClick, isAdmin }: { onCreateClick: () => void; isAdmin: boolean }) => (
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        {isAdmin ? 'Leave Requests Management' : 'My Leave Requests'}
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
      New Leave Request
    </Button>
  </div>
);

export default function LeaveRequestsPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  // Data fetching
  const {
    leaveRequests = [],
    myLeaveRequests = [],
    isLoading,
    createRequest,
    updateRequest,
    approveRequest,
    deleteRequest,
  } = useLeaveRequests();
  const { data: leaveTypes = [] } = useLeaveTypes();

  // Determine which data to use based on user role
  const allRequests = isAdmin() ? leaveRequests : myLeaveRequests;

  // Memoized handlers
  const handleEdit = useCallback((request: LeaveRequest) => {
    setSelectedRequest(request);
    setIsEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((request: LeaveRequest) => {
    setSelectedRequest(request);
    setIsDeleteDialogOpen(true);
  }, []);

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

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  // Memoized filtered and paginated data
  const filteredRequests = useMemo(() => {
    if (!searchTerm) return allRequests;

    const searchLower = searchTerm.toLowerCase();
    return allRequests.filter(
      (request) =>
        (request.leaveTypeName?.toLowerCase() || '').includes(searchLower) ||
        (request.requestComments?.toLowerCase() || '').includes(searchLower)
    );
  }, [allRequests, searchTerm]);

  const paginationInfo = useMemo(() => {
    const totalItems = filteredRequests.length;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const paginatedRequests = filteredRequests.slice(start, end);

    return {
      totalItems,
      paginatedRequests,
      currentPage,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }, [filteredRequests, currentPage, pageSize]);

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

  return (
    <div className="container mx-auto space-y-6 py-6">
      <PageHeader onCreateClick={() => setIsCreateDialogOpen(true)} isAdmin={isAdmin()} />

      {filteredRequests.length === 0 && !isLoading ? (
        <EmptyState onCreateClick={() => setIsCreateDialogOpen(true)} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {isAdmin() ? 'Leave Requests' : 'My Leave Requests'}
            </CardTitle>
            <CardDescription>
              {isAdmin()
                ? 'Manage employee leave requests'
                : 'View and manage your leave requests'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {isLoading && <LoadingOverlay />}
              <DataTable
                columns={columns}
                data={paginationInfo.paginatedRequests}
                isLoading={isLoading}
                searchPlaceholder="Search leave requests..."
                title={isAdmin() ? 'Leave Requests' : 'My Leave Requests'}
                subtitle={
                  isAdmin()
                    ? 'Manage employee leave requests'
                    : 'View and manage your leave requests'
                }
                initialPageSize={pageSize}
                pagination={true}
                tableOptions={{
                  pageSize,
                  pageIndex: currentPage - 1,
                  onPageSizeChange: handlePageSizeChange,
                  onPageChange: (newPage: number) => handlePageChange(newPage + 1),
                }}
              />
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Total requests: {paginationInfo.totalItems}
            </p>
          </CardFooter>
        </Card>
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
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
