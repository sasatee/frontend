// @ts-ignore
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/common/DataTable';
import { getCategoryGroupColumns } from '@/components/categoryGroup/columns';
import { CategoryGroupDialog } from '@/components/categoryGroup/CategoryGroupDialog';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ErrorAlert } from '@/components/ErrorAlert';
import { toast } from 'sonner';
import { categoryGroupService } from '@/services/categoryGroupService';
import { CategoryGroup } from '@/types/categoryGroup';

export default function CategoryGroupsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<CategoryGroup | null>(null);
  const [categoryGroupToDelete, setCategoryGroupToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: categoryGroups = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['categoryGroups'],
    queryFn: () => categoryGroupService.getCategoryGroups(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      categoryGroupService.updateCategoryGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categoryGroups'] });
      setIsDialogOpen(false);
      setSelectedCategoryGroup(null);
      toast.success('Category group updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update category group');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoryGroupService.deleteCategoryGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categoryGroups'] });
      setIsDeleteDialogOpen(false);
      setCategoryGroupToDelete(null);
      toast.success('Category group deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete category group');
    },
  });

  const handleEdit = (categoryGroup: CategoryGroup) => {
    setSelectedCategoryGroup(categoryGroup);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setCategoryGroupToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryGroupToDelete) {
      deleteMutation.mutate(categoryGroupToDelete);
    }
  };

  const handleSubmit = (data: any) => {
    if (selectedCategoryGroup) {
      updateMutation.mutate({ id: selectedCategoryGroup.id, data });
    }
  };

  if (isLoading) return <LoadingOverlay />;
  if (error)
    return <ErrorAlert message={error instanceof Error ? error.message : 'An error occurred'} />;

  const tableColumns = getCategoryGroupColumns({ onEdit: handleEdit, onDelete: handleDelete });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Category Groups</h1>
      </div>

      <DataTable
        columns={tableColumns}
        data={categoryGroups}
        searchPlaceholder="Search category groups..."
      />

      <CategoryGroupDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        categoryGroup={selectedCategoryGroup}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Category Group"
        description="Are you sure you want to delete this category group? This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
