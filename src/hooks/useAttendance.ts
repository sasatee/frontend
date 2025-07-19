import { useToast } from '@/components/ui/use-toast';
import {
  AttendanceDTO,
  createAttendance as createAttendanceService,
  deleteAttendance as deleteAttendanceService,
  getAttendances,
  updateAttendance as updateAttendanceService
} from '@/services/attendanceService';
import { Attendance } from '@/types/attendance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePaginatedData } from './usePaginatedData';

interface UpdateAttendanceInput {
  id: string;
  data: Partial<AttendanceDTO>;
}

export const useAttendance = (initialParams = {}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const paginatedData = usePaginatedData<Attendance, AttendanceDTO, UpdateAttendanceInput>({
    queryKey: 'attendances',
    fetchFn: getAttendances,
    createFn: createAttendanceService,
    updateFn: (data) => updateAttendanceService(data.id, data.data),
    deleteFn: deleteAttendanceService,
    idField: 'id',
    initialParams: {
      sortBy: 'date',
      sortDirection: 'desc',
      ...initialParams,
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const createAttendance = useMutation({
    mutationFn: createAttendanceService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      toast({
        title: 'Success',
        description: 'Attendance record created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to create attendance record: ${error.message}`,
      });
    },
  });

  const updateAttendance = useMutation({
    mutationFn: async ({ id, data }: UpdateAttendanceInput) => {
      try {
        console.log('Updating attendance with data:', { id, data });
        const result = await updateAttendanceService(id, data);
        console.log('Update result:', result);
        return result;
      } catch (error) {
        console.error('Update error in mutation:', error);
        throw error;
      }
    },
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['attendances'] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['attendances']);

      // Optimistically update to the new value
      queryClient.setQueryData(['attendances'], (old: Attendance[] = []) => {
        return old.map((item) =>
          item.id === id
            ? {
              ...item,
              ...data,
            }
            : item
        );
      });

      return { previousData };
    },
    onSuccess: (result, _variables) => {
      console.log('Update successful:', result);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      toast({
        title: 'Success',
        description: 'Attendance record updated successfully',
      });
    },
    onError: (error: Error, _variables, context) => {
      console.error('Update error:', error);
      // Rollback to the previous value
      if (context?.previousData) {
        queryClient.setQueryData(['attendances'], context.previousData);
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to update attendance record: ${error.message}`,
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
    },
  });

  const deleteAttendance = useMutation({
    mutationFn: deleteAttendanceService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      toast({
        title: 'Success',
        description: 'Attendance record deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to delete attendance record: ${error.message}`,
      });
    },
  });

  return {
    ...paginatedData,
    createAttendance,
    updateAttendance,
    deleteAttendance,
  };
};
