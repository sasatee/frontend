import { PaginationParams } from '@/hooks/usePaginatedData';
import axios from '@/lib/axios';
import { retryOperation, showErrorToast } from '@/lib/error-handler';
import { sanitizeObject } from '@/lib/utils';
import { CreateLeaveRequestDto, LeaveRequest, UpdateLeaveRequestDto } from '@/types/leaveRequest';

// Type for handling potential data wrapped in an object
interface LeaveRequestResponseWrapper {
  isSuccess?: boolean;
  message?: string;
  result?: LeaveRequest[] | LeaveRequest;
  [key: string]: any;
}

export class LeaveRequestService {
  private readonly headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  /**
   * Get all leave requests with optional pagination and filtering
   * @param params Pagination and filtering parameters
   * @returns Array of leave requests
   */
  async getLeaveRequests(params?: PaginationParams): Promise<LeaveRequest[]> {
    try {
      return await retryOperation(
        async () => {
          const response = await axios.get<LeaveRequestResponseWrapper>('/api/LeaveRequests');

          // Process the API response
          let leaveRequests: LeaveRequest[] = [];

          if (!response.data) {
            return [];
          }

          // Handle different response formats
          if (Array.isArray(response.data)) {
            leaveRequests = response.data;
          } else if (typeof response.data === 'object' && response.data !== null) {
            if (response.data.result && Array.isArray(response.data.result)) {
              leaveRequests = response.data.result;
            } else if (response.data.result && typeof response.data.result === 'object') {
              leaveRequests = [response.data.result as LeaveRequest];
            } else {
              // Try to find an array property
              for (const [key, value] of Object.entries(response.data)) {
                if (Array.isArray(value)) {
                  leaveRequests = value;
                  break;
                }
              }
            }
          }

          // Apply client-side filtering if search term is provided
          if (params?.search) {
            const searchLower = params.search.toLowerCase();
            leaveRequests = leaveRequests.filter(
              (request) =>
                request.leaveTypeName.toLowerCase().includes(searchLower) ||
                request.requestComments.toLowerCase().includes(searchLower)
            );
          }

          // Apply client-side sorting
          if (params?.sortBy) {
            leaveRequests.sort((a: any, b: any) => {
              const aValue = a[params.sortBy!];
              const bValue = b[params.sortBy!];

              // Handle string comparison
              if (typeof aValue === 'string' && typeof bValue === 'string') {
                return params.sortDirection === 'asc'
                  ? aValue.localeCompare(bValue)
                  : bValue.localeCompare(aValue);
              }

              // Handle date comparison
              if (aValue instanceof Date && bValue instanceof Date) {
                return params.sortDirection === 'asc'
                  ? aValue.getTime() - bValue.getTime()
                  : bValue.getTime() - aValue.getTime();
              }

              // Handle number comparison
              return params.sortDirection === 'asc'
                ? aValue > bValue
                  ? 1
                  : -1
                : aValue < bValue
                  ? 1
                  : -1;
            });
          }

          // Apply client-side pagination
          if (params?.page && params?.pageSize) {
            const start = (params.page - 1) * params.pageSize;
            const end = start + params.pageSize;
            leaveRequests = leaveRequests.slice(start, end);
          }

          return leaveRequests;
        },
        2,
        1000,
        'fetching leave requests'
      );
    } catch (error) {
      showErrorToast(error, 'fetching leave requests');
      return [];
    }
  }

  /**
   * Get my leave requests
   * @returns Array of leave requests for the current user
   */
  async getMyLeaveRequests(): Promise<LeaveRequest[]> {
    try {
      return await retryOperation(
        async () => {
          const response = await axios.get<LeaveRequestResponseWrapper>(
            '/api/LeaveRequests/GetMyLeaves'
          );

          let leaveRequests: LeaveRequest[] = [];

          if (!response.data) {
            return [];
          }

          if (Array.isArray(response.data)) {
            leaveRequests = response.data;
          } else if (response.data.result && Array.isArray(response.data.result)) {
            leaveRequests = response.data.result;
          }

          return leaveRequests;
        },
        2,
        1000,
        'fetching my leave requests'
      );
    } catch (error) {
      showErrorToast(error, 'fetching my leave requests');
      return [];
    }
  }

  /**
   * Create a new leave request
   * @param leaveRequest Leave request data to create
   * @returns Created leave request
   */
  async createLeaveRequest(leaveRequest: CreateLeaveRequestDto): Promise<LeaveRequest> {
    try {
      // Sanitize input data
      const sanitizedData = sanitizeObject(leaveRequest);

      // Call API
      const response = await axios.post<LeaveRequestResponseWrapper>(
        '/api/LeaveRequests',
        sanitizedData
      );

      // Extract leave request from response
      let createdRequest: LeaveRequest;

      if (response.data.result) {
        createdRequest = response.data.result as LeaveRequest;
      } else {
        // If the API doesn't return the created request, create one from request data
        createdRequest = {
          id: '',
          ...sanitizedData,
          approved: false,
          cancelled: false,
          leaveTypeName: '',
        };
      }

      return createdRequest;
    } catch (error) {
      const errorDetails = showErrorToast(error, 'creating leave request');
      throw new Error(errorDetails.message);
    }
  }

  /**
   * Update an existing leave request
   * @param id Leave request ID
   * @param leaveRequest Leave request data to update
   * @returns Updated leave request
   */
  async updateLeaveRequest(id: string, leaveRequest: UpdateLeaveRequestDto): Promise<LeaveRequest> {
    try {
      // Sanitize input data
      const sanitizedData = sanitizeObject(leaveRequest);

      // Call API
      const response = await axios.put<LeaveRequestResponseWrapper>(
        `/api/LeaveRequests/${id}`,
        sanitizedData
      );

      // Extract updated request from response
      let updatedRequest: LeaveRequest;

      if (response.data.result) {
        updatedRequest = response.data.result as LeaveRequest;
      } else {
        // If the API doesn't return the updated request, create one from request data
        updatedRequest = {
          id,
          ...sanitizedData,
          approved: false,
          cancelled: false,
          leaveTypeName: '',
        };
      }

      return updatedRequest;
    } catch (error) {
      const errorDetails = showErrorToast(error, 'updating leave request');
      throw new Error(errorDetails.message);
    }
  }

  /**
   * Approve or reject a leave request
   * @param id Leave request ID
   * @param approved Whether to approve or reject the request
   */
  async approveLeaveRequest(id: string, approved: boolean): Promise<void> {
    try {
      await axios.put(`/api/LeaveRequests/${id}/approve`, null, {
        params: { approved },
      });
    } catch (error) {
      const errorDetails = showErrorToast(
        error,
        `${approved ? 'approving' : 'rejecting'} leave request`
      );
      throw new Error(errorDetails.message);
    }
  }

  /**
   * Delete a leave request
   * @param id Leave request ID
   */
  async deleteLeaveRequest(id: string): Promise<void> {
    try {
      await axios.delete(`/api/LeaveRequests/${id}`);
    } catch (error) {
      const errorDetails = showErrorToast(error, 'deleting leave request');
      throw new Error(errorDetails.message);
    }
  }
}

// Create a singleton instance
const leaveRequestService = new LeaveRequestService();

// Export functions for direct use
export const getLeaveRequests = (params?: PaginationParams) =>
  leaveRequestService.getLeaveRequests(params);

export const getMyLeaveRequests = () => leaveRequestService.getMyLeaveRequests();

export const createLeaveRequest = (leaveRequest: CreateLeaveRequestDto) =>
  leaveRequestService.createLeaveRequest(leaveRequest);

export const updateLeaveRequest = (id: string, leaveRequest: UpdateLeaveRequestDto) =>
  leaveRequestService.updateLeaveRequest(id, leaveRequest);

export const approveLeaveRequest = (id: string, approved: boolean) =>
  leaveRequestService.approveLeaveRequest(id, approved);

export const deleteLeaveRequest = (id: string) => leaveRequestService.deleteLeaveRequest(id);
