import { PaginationParams } from '@/hooks/usePaginatedData';
import axios from '@/lib/axios';
import { getErrorMessage, retryOperation, showErrorToast } from '@/lib/error-handler';
import { sanitizeObject } from '@/lib/utils';
import { CreateLeaveRequestDto, LeaveRequest, UpdateLeaveRequestDto } from '@/types/leaveRequest';

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
          const response = await axios.get<LeaveRequest[]>('/api/LeaveRequests');

          // The API returns a direct array of LeaveRequest objects
          let leaveRequests: LeaveRequest[] = [];

          if (!response.data) {
            return [];
          }

          // Handle different response formats
          if (Array.isArray(response.data)) {
            leaveRequests = response.data;
          } else if (typeof response.data === 'object' && response.data !== null) {
            // Handle wrapped response if needed
            const data = response.data as any;
            if (data.result && Array.isArray(data.result)) {
              leaveRequests = data.result;
            } else if (data.result && typeof data.result === 'object') {
              leaveRequests = [data.result as LeaveRequest];
            } else {
              // Try to find an array property
              for (const [key, value] of Object.entries(data)) {
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
                (request.leaveTypeName?.toLowerCase() || '').includes(searchLower) ||
                (request.requestComments?.toLowerCase() || '').includes(searchLower)
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
          const response = await axios.get<any>('/api/LeaveRequests/GetMyLeaves');

          let leaveRequests: LeaveRequest[] = [];

          if (!response.data) {
            return [];
          }

          // Handle the API response structure based on Swagger documentation
          if (Array.isArray(response.data)) {
            // Direct array response
            leaveRequests = response.data;
          } else {
            const data = response.data as any;
            
            // Check for userLeave array (from Swagger response)
            if (data.userLeave && Array.isArray(data.userLeave)) {
              leaveRequests = data.userLeave;
            }
            // Check for result array (fallback)
            else if (data.result && Array.isArray(data.result)) {
              leaveRequests = data.result;
            }
            // Check for any other array property
            else {
              for (const [key, value] of Object.entries(data)) {
                if (Array.isArray(value)) {
                  leaveRequests = value;
                  break;
                }
              }
            }
          }

          // Add missing fields if they don't exist
          leaveRequests = leaveRequests.map(request => ({
            ...request,
            cancelled: request.cancelled ?? false,
            requestingEmployeeId: request.requestingEmployeeId || '',
            leaveTypeName: request.leaveTypeName || '',
          }));

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
      const response = await axios.post<LeaveRequest>('/api/LeaveRequests', sanitizedData);

      // Extract leave request from response
      let createdRequest: LeaveRequest;

      if (response.data) {
        createdRequest = response.data;
      } else {
        // If the API doesn't return the created request, create one from request data
        createdRequest = {
          id: '',
          ...sanitizedData,
          approved: null,
          cancelled: false,
          leaveTypeName: '',
        };
      }

      return createdRequest;
    } catch (error) {
      showErrorToast(error, 'creating leave request');
      throw new Error(getErrorMessage(error, 'creating leave request'));
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
      const response = await axios.put<LeaveRequest>(`/api/LeaveRequests/${id}`, sanitizedData);

      // Extract updated request from response
      let updatedRequest: LeaveRequest;

      if (response.data) {
        updatedRequest = response.data;
      } else {
        // If the API doesn't return the updated request, create one from request data
        updatedRequest = {
          id,
          ...sanitizedData,
          approved: null,
          cancelled: false,
          leaveTypeName: '',
          requestingEmployeeId: '',
        };
      }

      return updatedRequest;
    } catch (error) {
      showErrorToast(error, 'updating leave request');
      throw new Error(getErrorMessage(error, 'updating leave request'));
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
      showErrorToast(
        error,
        `${approved ? 'approving' : 'rejecting'} leave request`
      );
      throw new Error(getErrorMessage(error, `${approved ? 'approving' : 'rejecting'} leave request`));
    }
  }

  /**
   * Cancel a leave request
   * @param id Leave request ID
   * @param cancel Whether to cancel the request
   */
  async cancelLeaveRequest(id: string, cancel: boolean): Promise<void> {
    try {
      await axios.put(`/api/LeaveRequests/${id}/cancel`, null, {
        params: { cancel },
      });
    } catch (error) {
      showErrorToast(
        error,
        `${cancel ? 'cancelling' : 'uncancelling'} leave request`
      );
      throw new Error(getErrorMessage(error, `${cancel ? 'cancelling' : 'uncancelling'} leave request`));
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
      showErrorToast(error, 'deleting leave request');
      throw new Error(getErrorMessage(error, 'deleting leave request'));
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

export const cancelLeaveRequest = (id: string, cancel: boolean) =>
  leaveRequestService.cancelLeaveRequest(id, cancel);

export const deleteLeaveRequest = (id: string) => leaveRequestService.deleteLeaveRequest(id);
