import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { getDeductionColumns } from '@/components/deduction/columns';
import { DeductionDialog } from '@/components/deduction/DeductionDialog';
import { ConfirmActionDialog } from '@/components/ConfirmActionDialog';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ErrorAlert } from '@/components/ErrorAlert';
import { useDeductions } from '@/hooks/useDeductions';
import { Deduction, CreateDeductionDto, UpdateDeductionDto } from '@/types/deduction';

export default function DeductionsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDeduction, setSelectedDeduction] = useState<Deduction | undefined>(undefined);
  const [deductionToDelete, setDeductionToDelete] = useState<string | null>(null);

  const {
    deductions,
    isLoading,
    error,
    createDeduction: createDeductionMutation,
    updateDeduction: updateDeductionMutation,
    deleteDeduction: deleteDeductionMutation,
    isCreating,
    isUpdating,
    isDeleting,
  } = useDeductions();

  const handleAdd = () => {
    setSelectedDeduction(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (deduction: Deduction) => {
    setSelectedDeduction(deduction);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeductionToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deductionToDelete) {
      deleteDeductionMutation(deductionToDelete);
      setIsDeleteDialogOpen(false);
      setDeductionToDelete(null);
    }
  };

  const handleSubmit = (data: CreateDeductionDto | UpdateDeductionDto) => {
    if (selectedDeduction) {
      updateDeductionMutation({ id: selectedDeduction.id, data });
    } else {
      createDeductionMutation(data);
    }
    setIsDialogOpen(false);
    setSelectedDeduction(undefined);
  };

  if (isLoading) return <LoadingOverlay />;
  if (error)
    return <ErrorAlert message={error instanceof Error ? error.message : 'An error occurred'} />;

  const tableColumns = getDeductionColumns({ onEdit: handleEdit, onDelete: handleDelete });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Deductions</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Deduction
        </Button>
      </div>

      <DataTable
        columns={tableColumns}
        data={deductions}
        searchPlaceholder="Search deductions..."
      />

      <DeductionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={selectedDeduction}
        onSubmit={handleSubmit}
        mode={selectedDeduction ? 'edit' : 'create'}
      />

      <ConfirmActionDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Deduction"
        description="Are you sure you want to delete this deduction? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}
