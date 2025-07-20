// @ts-ignore
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { columns } from '@/components/department/columns';
import DepartmentDialog from '@/components/department/DepartmentDialog';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ErrorAlert } from '@/components/ErrorAlert';
import { useDepartments } from '@/hooks/useDepartments';
import { Department } from '@/types/department';
import { DepartmentFormValues } from '@/schemas/department';

export default function DepartmentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>(undefined);
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null);

  const {
    data: departments,
    isLoading,
    error,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    isCreating,
    isUpdating,
    isDeleting,
  } = useDepartments();

  const handleAdd = () => {
    setSelectedDepartment(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDepartmentToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (departmentToDelete) {
      deleteDepartment(departmentToDelete);
    }
  };

  const handleDialogSubmit = (values: DepartmentFormValues) => {
    if (selectedDepartment) {
      updateDepartment({
        id: selectedDepartment.id,
        data: values,
      });
    } else {
      createDepartment(values);
    }
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return <ErrorAlert message={error instanceof Error ? error.message : 'An error occurred'} />;
  }

  const tableColumns = columns({ onEdit: handleEdit, onDelete: handleDelete });
  const tableData = departments || [];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Departments</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      <DataTable
        columns={tableColumns}
        data={tableData}
        searchPlaceholder="Search departments..."
      />

      <DepartmentDialog
        department={selectedDepartment}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleDialogSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Department"
        description="Are you sure you want to delete this department? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}
