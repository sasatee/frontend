import { useToast } from '@/components/ui/use-toast';
import {
  approveLeaveRequest,
  createLeaveRequest,
  deleteLeaveRequest,
  getLeaveRequests,
  getMyLeaveRequests,
  updateLeaveRequest,
} from '@/services/leaveRequestService';
import { CreateLeaveRequestDto, UpdateLeaveRequestDto } from '@/types/leaveRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PaginationParams } from './usePaginatedData';

interface UpdateRequestParams {
  id: string;
  data: UpdateLeaveRequestDto;
}

interface ApproveRequestParams {
  id: string;
  approved: boolean;
}

export function useLeaveRequests(params?: PaginationParams) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Common query configuration
  const queryConfig = {
    staleTime: 10 * 1000, // 10 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000,
  };

  // Query for fetching all leave requests (admin only)
  const {
    data: leaveRequests,
    isLoading,
    refetch,
    error: leaveRequestsError,
  } = useQuery({
    queryKey: ['leaveRequests', params],
    queryFn: () => getLeaveRequests(params),
    ...queryConfig,
  });

  // Query for fetching current user's leave requests
  const {
    data: myLeaveRequests,
    isLoading: isLoadingMyRequests,
    error: myLeaveRequestsError,
  } = useQuery({
    queryKey: ['myLeaveRequests'],
    queryFn: () => getMyLeaveRequests(),
    ...queryConfig,
  });

  // Mutation for creating a leave request
  const createRequest = useMutation({
    mutationFn: (data: CreateLeaveRequestDto) => createLeaveRequest(data),
    onSuccess: async () => {
      // Batch invalidate queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['leaveRequests'] }),
        queryClient.invalidateQueries({ queryKey: ['myLeaveRequests'] }),
      ]);

      toast({
        title: 'Success',
        description: 'Leave request created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create leave request',
      });
    },
  });

  // Mutation for updating a leave request
  const updateRequest = useMutation({
    mutationFn: ({ id, data }: UpdateRequestParams) => updateLeaveRequest(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      await queryClient.invalidateQueries({ queryKey: ['myLeaveRequests'] });
      await refetch();

      toast({
        title: 'Success',
        description: 'Leave request updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update leave request',
      });
    },
  });

  // Mutation for approving a leave request
  const approveRequest = useMutation({
    mutationFn: ({ id, approved }: ApproveRequestParams) => approveLeaveRequest(id, approved),
    onSuccess: async (_, { approved }) => {
      await queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      await queryClient.invalidateQueries({ queryKey: ['myLeaveRequests'] });
      await refetch();

      toast({
        title: 'Success',
        description: `Leave request ${approved ? 'approved' : 'rejected'} successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to process leave request',
      });
    },
  });

  // Mutation for deleting a leave request
  const deleteRequest = useMutation({
    mutationFn: (id: string) => deleteLeaveRequest(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      await queryClient.invalidateQueries({ queryKey: ['myLeaveRequests'] });
      await refetch();

      toast({
        title: 'Success',
        description: 'Leave request deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete leave request',
      });
    },
  });

  return {
    // Queries
    leaveRequests,
    myLeaveRequests,
    isLoading,
    isLoadingMyRequests,
    leaveRequestsError,
    myLeaveRequestsError,

    // Mutations
    createRequest,
    updateRequest,
    approveRequest,
    deleteRequest,
    refetch,
  };
}
