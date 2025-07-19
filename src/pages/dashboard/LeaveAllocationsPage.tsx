import React, { useState } from 'react';
import LeaveAllocationTable from '@/components/leaveAllocation/LeaveAllocationTable';
import LeaveAllocationDialog from '@/components/leaveAllocation/LeaveAllocationDialog';
import { useCreateLeaveAllocation } from '@/hooks/useCreateLeaveAllocation';
import { useDeleteLeaveAllocation } from '@/hooks/useDeleteLeaveAllocation';
import { LeaveAllocation, LeaveAllocationPayload } from '@/types/leaveAllocation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ConfirmActionDialog } from '@/components/ConfirmActionDialog';
import { Plus } from 'lucide-react';

const LeaveAllocationsPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<LeaveAllocation | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const createMutation = useCreateLeaveAllocation();
  const deleteMutation = useDeleteLeaveAllocation();

  const handleCreate = () => {
    setSelected(null);
    setDialogOpen(true);
  };

  const handleDelete = (allocation: LeaveAllocation) => {
    setSelected(allocation);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    try {
      await deleteMutation.mutateAsync(selected.id);
      toast({
        title: 'Success',
        description: 'Leave allocation deleted successfully',
      });
      setDeleteDialogOpen(false);
      setSelected(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete leave allocation',
      });
    }
  };

  const handleDialogSubmit = async (values: LeaveAllocationPayload) => {
    try {
      await createMutation.mutateAsync(values);
      toast({
        title: 'Success',
        description: 'Leave allocation created successfully',
      });
      setDialogOpen(false);
      setSelected(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save leave allocation',
      });
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelected(null);
    }
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setSelected(null);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leave Allocations</h1>
        <Button onClick={handleCreate} disabled={createMutation.isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Create Leave Allocation
        </Button>
      </div>

      <LeaveAllocationTable onDelete={handleDelete} />

      <LeaveAllocationDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        onSubmit={handleDialogSubmit}
        initialValues={{
          period: new Date().getFullYear(),
        }}
      />

      <ConfirmActionDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogOpenChange}
        onConfirm={handleConfirmDelete}
        title="Delete Leave Allocation"
        description="Are you sure you want to delete this leave allocation? This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default LeaveAllocationsPage;
