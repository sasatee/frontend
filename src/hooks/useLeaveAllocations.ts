import { useQuery } from '@tanstack/react-query';
import { getAllLeaveAllocations } from '../services/leaveAllocationService';

export const useLeaveAllocations = () => {
  return useQuery({
    queryKey: ['leaveAllocations'],
    queryFn: getAllLeaveAllocations,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
