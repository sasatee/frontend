import { getLeaveBalance } from '@/services/leaveAllocationService';
import { useQuery } from '@tanstack/react-query';

interface UseLeaveBalanceParams {
  employeeId: string;
  period: number;
  leaveTypeId?: string;
  enabled?: boolean;
}

export const useLeaveBalance = ({
  employeeId,
  period,
  leaveTypeId,
  enabled = true
}: UseLeaveBalanceParams) => {
  return useQuery({
    queryKey: ['leaveBalance', employeeId, period, leaveTypeId],
    queryFn: () => getLeaveBalance(employeeId, period, leaveTypeId),
    enabled: enabled && !!employeeId && !!period,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: 1000,
  });
};
