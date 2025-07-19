import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { getJobTitleColumns } from '@/components/jobTitle/columns';
import { JobTitleDialog } from '@/components/jobTitle/JobTitleDialog';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ErrorAlert } from '@/components/ErrorAlert';
import { toast } from 'sonner';
import { jobTitleService } from '@/services/jobTitleService';
import { JobTitle } from '@/types/jobTitle';
import { JobTitleFormValues } from '@/schemas/jobTitle';

export default function JobTitlesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState<JobTitle | null>(null);
  const [jobTitleToDelete, setJobTitleToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: jobTitles = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['jobTitles'],
    queryFn: () => jobTitleService.getAllJobTitles(),
  });

  const createMutation = useMutation({
    mutationFn: (data: JobTitleFormValues) => jobTitleService.createJobTitle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobTitles'] });
      setIsDialogOpen(false);
      setSelectedJobTitle(null);
      toast.success('Job title created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create job title');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: JobTitleFormValues }) =>
      jobTitleService.updateJobTitle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobTitles'] });
      setIsDialogOpen(false);
      setSelectedJobTitle(null);
      toast.success('Job title updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update job title');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobTitleService.deleteJobTitle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobTitles'] });
      setIsDeleteDialogOpen(false);
      setJobTitleToDelete(null);
      toast.success('Job title deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete job title');
    },
  });

  const handleAdd = () => {
    setSelectedJobTitle(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (jobTitle: JobTitle) => {
    setSelectedJobTitle(jobTitle);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setJobTitleToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (jobTitleToDelete) {
      deleteMutation.mutate(jobTitleToDelete);
    }
  };

  const handleSubmit = (data: JobTitleFormValues) => {
    if (selectedJobTitle) {
      updateMutation.mutate({ id: selectedJobTitle.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) return <LoadingOverlay />;
  if (error)
    return <ErrorAlert message={error instanceof Error ? error.message : 'An error occurred'} />;

  const tableColumns = getJobTitleColumns({ onEdit: handleEdit, onDelete: handleDelete });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Job Titles</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Job Title
        </Button>
      </div>

      <DataTable columns={tableColumns} data={jobTitles} searchPlaceholder="Search job titles..." />

      <JobTitleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        jobTitle={selectedJobTitle}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Job Title"
        description="Are you sure you want to delete this job title? This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
