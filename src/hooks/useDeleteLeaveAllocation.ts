import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteLeaveAllocation } from '../services/leaveAllocationService';

export const useDeleteLeaveAllocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLeaveAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveAllocations'] });
    },
  });
};
