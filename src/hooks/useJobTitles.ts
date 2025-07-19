import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobTitleService } from '@/services/jobTitleService';
import { JobTitle, CreateJobTitleDto, UpdateJobTitleDto } from '@/types/jobTitle';
import { toast } from 'sonner';

interface UpdateJobTitleInput extends UpdateJobTitleDto {
  id: string;
}

export const useJobTitles = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['jobTitles'],
    queryFn: () => jobTitleService.getAllJobTitles(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateJobTitleDto) => jobTitleService.createJobTitle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobTitles'] });
      toast.success('Job title created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create job title');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateJobTitleInput) =>
      jobTitleService.updateJobTitle(data.id, {
        title: data.title,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobTitles'] });
      toast.success('Job title updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update job title');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobTitleService.deleteJobTitle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobTitles'] });
      toast.success('Job title deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete job title');
    },
  });

  return {
    // Query data
    data: query.data || [],
    isLoading: query.isLoading,
    error: query.error,

    // Mutations
    createJobTitle: createMutation.mutate,
    updateJobTitle: updateMutation.mutate,
    deleteJobTitle: deleteMutation.mutate,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useJobTitleByEmployee = (employeeId: string | undefined) => {
  return useQuery({
    queryKey: ['jobTitle', 'employee', employeeId],
    queryFn: () => {
      if (!employeeId) return null;
      return jobTitleService.getJobTitleByEmployee(employeeId);
    },
    enabled: !!employeeId,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
  });
};
