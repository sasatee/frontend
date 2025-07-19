import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Department, CreateDepartmentDto, UpdateDepartmentDto } from '@/types/department';
import { departmentService } from '@/services/departmentService';
import { toast } from 'sonner';

interface UpdateDepartmentInput {
  id: string;
  data: UpdateDepartmentDto;
}

export const useDepartments = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const result = await departmentService.getDepartments();
      return result;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    retry: 3,
    retryDelay: 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDepartmentDto) => departmentService.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created successfully');
    },
    onError: (error: any) => {
      console.error('Create department error:', error);
      toast.error(error.message || 'Failed to create department');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateDepartmentInput) =>
      departmentService.updateDepartment(data.id, data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department updated successfully');
    },
    onError: (error: any) => {
      console.error('Update department error:', error);
      toast.error(error.message || 'Failed to update department');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => departmentService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete department error:', error);
      toast.error(error.message || 'Failed to delete department');
    },
  });

  // Ensure we always return an array, even during loading
  const departments = query.data || [];

  return {
    // Query data
    data: departments,
    isLoading: query.isLoading,
    error: query.error,

    // Mutations
    createDepartment: createMutation.mutate,
    updateDepartment: updateMutation.mutate,
    deleteDepartment: deleteMutation.mutate,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
