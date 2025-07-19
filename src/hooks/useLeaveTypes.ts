import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
} from '../services/leaveTypeService';
import type { LeaveType } from '@/types/leaveType';

interface UseLeaveTypesOptions {
  pageSize?: number;
  staleTime?: number;
  retry?: number;
  retryDelay?: number;
}

export const useLeaveTypes = (options: UseLeaveTypesOptions = {}) => {
  const queryClient = useQueryClient();
  const { pageSize = 10, staleTime = 5 * 60 * 1000, retry = 2, retryDelay = 1000 } = options;

  const query = useQuery({
    queryKey: ['leave-types'],
    queryFn: () => getLeaveTypes(),
    staleTime,
    retry,
    retryDelay,
  });

  const createMutation = useMutation({
    mutationFn: createLeaveType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateLeaveType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLeaveType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
    },
  });

  return {
    ...query,
    createLeaveType: createMutation.mutateAsync,
    updateLeaveType: updateMutation.mutateAsync,
    deleteLeaveType: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
