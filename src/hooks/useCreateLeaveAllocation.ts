import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLeaveAllocation } from '../services/leaveAllocationService';
import { useToast } from '@/components/ui/use-toast';

export const useCreateLeaveAllocation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createLeaveAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveAllocations'] });
      toast({
        title: 'Success',
        description: 'Leave allocation created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create leave allocation',
      });
      throw error;
    },
  });
};
