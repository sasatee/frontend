import React, { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLoading } from '@/contexts/LoadingContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { getColumns } from '@/components/leaveType/columns';
import LeaveTypeDialog from '@/components/leaveType/LeaveTypeDialog';
import { ConfirmActionDialog } from '@/components/ConfirmActionDialog';
import { useLeaveTypes } from '@/hooks/useLeaveTypes';
import { LeaveType } from '@/types/leaveType';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Plus } from 'lucide-react';

export default function LeaveTypesPage() {
  // State management
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | undefined>(undefined);
  const [openLeaveTypeDialog, setOpenLeaveTypeDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Hooks
  const { withLoading } = useLoading();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch leave types data
  const {
    data: leaveTypes = [],
    isLoading,
    isError,
    error,
    refetch,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType,
    isCreating,
    isUpdating,
    isDeleting,
  } = useLeaveTypes({
    pageSize: 10,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

  // Handlers
  const handleCreate = useCallback(() => {
    setSelectedLeaveType(undefined);
    setOpenLeaveTypeDialog(true);
  }, []);

  const handleEdit = useCallback((leaveType: LeaveType) => {
    setSelectedLeaveType(leaveType);
    setOpenLeaveTypeDialog(true);
  }, []);

  const handleDelete = useCallback((leaveType: LeaveType) => {
    setSelectedLeaveType(leaveType);
    setOpenDeleteDialog(true);
  }, []);

  const handleSubmit = async (values: any) => {
    console.log('LeaveTypesPage handleSubmit called with:', values);
    console.log('selectedLeaveType:', selectedLeaveType);
    
    // Ensure defaultDays is a number
    const processedValues = {
      ...values,
      defaultDays: typeof values.defaultDays === 'string' ? Number(values.defaultDays) : values.defaultDays
    };
    
    console.log('Processed values:', processedValues);
    
    if (selectedLeaveType && selectedLeaveType.id) {
      console.log('Updating leave type with ID:', selectedLeaveType.id);
      await updateLeaveType({ id: selectedLeaveType.id, data: processedValues });
    } else {
      console.log('Creating new leave type');
      await createLeaveType(processedValues);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedLeaveType) {
      await deleteLeaveType(selectedLeaveType.id);
      setOpenDeleteDialog(false);
      setSelectedLeaveType(undefined);
    }
  };

  // Get column definitions (after handlers are defined)
  const columns = React.useMemo(
    () => getColumns(handleEdit, handleDelete),
    [handleEdit, handleDelete]
  );

  // Force immediate refresh when the component mounts
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['leaveTypes'] });
  }, [queryClient]);

  // Error handling
  if (isError) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <h2 className="text-lg font-semibold text-destructive">Error Loading Leave Types</h2>
        <p className="mt-2 text-sm text-destructive/80">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Leave Types</h1>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Leave Type
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={leaveTypes}
          isLoading={isLoading}
          onRowClick={handleEdit}
          searchPlaceholder="Search leave types..."
          pagination={true}
          initialPageSize={10}
        />

        <LeaveTypeDialog
          open={openLeaveTypeDialog}
          onOpenChange={setOpenLeaveTypeDialog}
          leaveType={selectedLeaveType}
          onSubmit={handleSubmit}
          isSubmitting={selectedLeaveType ? isUpdating : isCreating}
        />

        <ConfirmActionDialog
          open={openDeleteDialog}
          onOpenChange={setOpenDeleteDialog}
          title="Delete Leave Type"
          description={`Are you sure you want to delete "${selectedLeaveType?.name}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
        />
      </div>
    </ErrorBoundary>
  );
}
