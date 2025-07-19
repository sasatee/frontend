import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLeaveAllocation } from '../services/leaveAllocationService';

export const useUpdateLeaveAllocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { numberOfDays: number; period: number };
    }) => updateLeaveAllocation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveAllocations'] });
    },
  });
};
