import { useToast } from '@/components/ui/use-toast';
import {
  approveLeaveRequest,
  cancelLeaveRequest,
  createLeaveRequest,
  deleteLeaveRequest,
  getLeaveRequests,
  getMyLeaveRequests,
  updateLeaveRequest,
} from '@/services/leaveRequestService';
import { CreateLeaveRequestDto, UpdateLeaveRequestDto } from '@/types/leaveRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PaginationParams } from './usePaginatedData';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin } from '@/lib/jwt-utils';

interface UpdateRequestParams {
  id: string;
  data: UpdateLeaveRequestDto;
}

interface ApproveRequestParams {
  id: string;
  approved: boolean;
}

interface CancelRequestParams {
  id: string;
  cancel: boolean;
}

export function useLeaveRequests(params?: PaginationParams) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if user is admin - handle case where user might not be available
  const isAdminUser = user?.roles ? isAdmin(user.roles) : false;

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
    isLoading: isLoadingAllRequests,
    refetch: refetchAllRequests,
    error: leaveRequestsError,
  } = useQuery({
    queryKey: ['leaveRequests', params],
    queryFn: () => getLeaveRequests(params),
    ...queryConfig,
    enabled: isAdminUser && !!user, // Only fetch if user is admin and user is available
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
    enabled: !!user, // Only fetch if user is available
  });

  // Determine which data and loading state to use
  const isLoading = isAdminUser ? isLoadingAllRequests : isLoadingMyRequests;
  const refetch = isAdminUser ? refetchAllRequests : () => {};

  // Safety check - if user is not available, don't show loading
  const safeIsLoading = !user ? false : isLoading;

  // Mutation for creating a leave request
  const createRequest = useMutation({
    mutationFn: (data: CreateLeaveRequestDto) => createLeaveRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myLeaveRequests'] });

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myLeaveRequests'] });

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
    onSuccess: (_, { approved }) => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myLeaveRequests'] });

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

  // Mutation for cancelling a leave request
  const cancelRequest = useMutation({
    mutationFn: ({ id, cancel }: CancelRequestParams) => cancelLeaveRequest(id, cancel),
    onSuccess: (_, { cancel }) => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myLeaveRequests'] });

      toast({
        title: 'Success',
        description: `Leave request ${cancel ? 'cancelled' : 'uncancelled'} successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to cancel leave request',
      });
    },
  });

  // Mutation for deleting a leave request
  const deleteRequest = useMutation({
    mutationFn: (id: string) => deleteLeaveRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myLeaveRequests'] });

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
    leaveRequests: isAdminUser ? leaveRequests : [],
    myLeaveRequests: myLeaveRequests || [],
    isLoading: safeIsLoading,
    isLoadingMyRequests,
    leaveRequestsError,
    myLeaveRequestsError,

    // Mutations
    createRequest,
    updateRequest,
    approveRequest,
    cancelRequest,
    deleteRequest,
    refetch,
  };
}
