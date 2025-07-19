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
import { useState } from 'react';

export default function MyLeaveRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { toast } = useToast();

  const { myLeaveRequests, isLoadingMyRequests, createRequest, updateRequest, deleteRequest } =
    useLeaveRequests();

  const { data: leaveTypes = [] } = useLeaveTypes();

  const handleEdit = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = async (values: LeaveRequestFormValues) => {
    try {
      await createRequest.mutateAsync(values);
      setIsCreateDialogOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const handleEditSubmit = async (values: LeaveRequestFormValues) => {
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
  };

  const handleDeleteConfirm = async () => {
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
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const columns = getLeaveRequestColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onApprove: () => { },
    showActions: false,
  });

  // Filter leave requests based on search term
  const filteredRequests =
    myLeaveRequests?.filter(
      (request) =>
        request.leaveTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requestComments?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Calculate pagination
  const totalItems = filteredRequests.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Leave Requests</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Leave Request
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Leave Requests</CardTitle>
          <CardDescription>View and manage your leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {isLoadingMyRequests && <LoadingOverlay />}
            <DataTable
              columns={columns}
              data={paginatedRequests}
              isLoading={isLoadingMyRequests}
              searchable={true}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              pagination={true}
              pageSize={pageSize}
              currentPage={currentPage}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
              density="normal"
            />
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Total requests: {myLeaveRequests?.length || 0}
          </p>
        </CardFooter>
      </Card>

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
