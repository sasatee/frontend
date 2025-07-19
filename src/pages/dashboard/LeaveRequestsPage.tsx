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
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useLeaveTypes } from '@/hooks/useLeaveTypes';
import { LeaveRequestFormValues } from '@/schemas/leaveRequest';
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

// Memoized header component
const PageHeader = ({ onCreateClick }: { onCreateClick: () => void }) => (
  <div className="flex items-center justify-between">
    <h1 className="text-3xl font-bold">Leave Requests</h1>
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

  // Data fetching
  const {
    leaveRequests = [],
    isLoading,
    createRequest,
    updateRequest,
    approveRequest,
    deleteRequest,
  } = useLeaveRequests();
  const { data: leaveTypes = [] } = useLeaveTypes();

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

  // Memoized data transformations
  const filteredRequests = useMemo(
    () =>
      leaveRequests.filter(
        (request: LeaveRequest) =>
          request.leaveTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.requestComments?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [leaveRequests, searchTerm]
  );

  const paginationInfo = useMemo(() => {
    const totalItems = filteredRequests.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

    return {
      totalItems,
      totalPages,
      paginatedRequests,
    };
  }, [filteredRequests, currentPage, pageSize]);

  // Memoized columns
  const columns = useMemo(
    () =>
      getLeaveRequestColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onApprove: handleApprove,
      }),
    [handleEdit, handleDelete, handleApprove]
  );

  return (
    <div className="container mx-auto space-y-6 py-6">
      <PageHeader onCreateClick={() => setIsCreateDialogOpen(true)} />

      {filteredRequests.length === 0 && !isLoading ? (
        <EmptyState onCreateClick={() => setIsCreateDialogOpen(true)} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Leave Requests</CardTitle>
            <CardDescription>Manage employee leave requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {isLoading && <LoadingOverlay />}
              <DataTable
                columns={columns}
                data={paginationInfo.paginatedRequests}
                isLoading={isLoading}
                searchPlaceholder="Search leave requests..."
                title="Leave Requests"
                subtitle="Manage employee leave requests"
                initialPageSize={pageSize}
                pagination={true}
                tableOptions={{
                  pageSize,
                  pageIndex: currentPage - 1,
                  onPageSizeChange: handlePageSizeChange,
                  onPageChange: (newPage) => handlePageChange(newPage + 1),
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
      {selectedRequest && (
        <LeaveRequestDialog
          leaveRequest={selectedRequest}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleEditSubmit}
          leaveTypes={leaveTypes}
        />
      )}

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
