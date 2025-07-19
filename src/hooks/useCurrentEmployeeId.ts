import { getCurrentUserEmployeeIdFromEmployees } from '@/lib/data-access-control';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to get the current user's employee ID by matching appUserId from JWT token with employee data
 * @returns Object containing employeeId, isLoading, and error
 */
export const useCurrentEmployeeId = () => {
    return useQuery({
        queryKey: ['currentEmployeeId'],
        queryFn: getCurrentUserEmployeeIdFromEmployees,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        retryDelay: 1000,
    });
}; 