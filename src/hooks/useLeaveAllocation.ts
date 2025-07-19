import { useQuery } from '@tanstack/react-query';
import { getLeaveAllocationById } from '../services/leaveAllocationService';

export const useLeaveAllocation = (id: string) => {
  return useQuery({
    queryKey: ['leaveAllocation', id],
    queryFn: () => getLeaveAllocationById(id),
    enabled: !!id,
  });
};
