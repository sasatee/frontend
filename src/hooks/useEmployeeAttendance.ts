import { getEmployeeAttendance } from '@/services/attendanceService';
import { Attendance } from '@/types/attendance';
import { useQuery } from '@tanstack/react-query';
import { useCurrentEmployeeId } from './useCurrentEmployeeId';

interface UseEmployeeAttendanceOptions {
    month?: string; // YYYY-MM format
    enabled?: boolean;
}

export function useEmployeeAttendance(options: UseEmployeeAttendanceOptions = {}) {
    const { month, enabled = true } = options;
    const { data: currentEmployeeId, isLoading: isLoadingEmployeeId } = useCurrentEmployeeId();

    const {
        data: attendanceRecords = [],
        isLoading: isLoadingAttendance,
        error,
        refetch,
    } = useQuery<Attendance[]>({
        queryKey: ['employee-attendance', currentEmployeeId, month],
        queryFn: async () => {
            if (!currentEmployeeId) {
                throw new Error('Employee ID not found');
            }

            console.log('🔄 Fetching employee attendance:', { currentEmployeeId, month });
            return await getEmployeeAttendance(currentEmployeeId as string, month);
        },
        enabled: enabled && !!currentEmployeeId && typeof currentEmployeeId === 'string',
        retry: 2,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    });

    return {
        attendanceRecords,
        isLoading: isLoadingEmployeeId || isLoadingAttendance,
        error,
        refetch,
        currentEmployeeId,
    };
} 