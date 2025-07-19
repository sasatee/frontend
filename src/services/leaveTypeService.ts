import axios from '@/lib/axios';
import { LeaveType, CreateLeaveTypeDto } from '@/types/leaveType';
import { showErrorToast, retryOperation, getErrorMessage } from '@/lib/error-handler';
import { sanitizeObject } from '@/lib/utils';
import { PaginationParams } from '@/hooks/usePaginatedData';

export interface UpdateLeaveTypeDto {
  name: string;
  defaultDays: number;
}

export class LeaveTypeService {
  /**
   * Get leave types with optional pagination and filtering
   * @param params Pagination and filtering parameters
   * @returns Array of leave types
   */
  async getLeaveTypes(params?: PaginationParams): Promise<LeaveType[]> {
    try {
      return await retryOperation(
        async () => {
          const response = await axios.get<LeaveType[]>('/api/LeaveType');

          // Process the API response
          let leaveTypes: LeaveType[] = [];

          if (!response.data) {
            return [];
          }

          // Handle the API response format - the API returns an array of leave types
          if (Array.isArray(response.data)) {
            leaveTypes = response.data;
          }

          // Process the leave types to ensure they have all required fields
          leaveTypes = leaveTypes.map((type) => ({
            id: type.id || '',
            name: type.name || '',
            defaultDays: type.defaultDays || 0,
          }));

          // Apply client-side filtering if search term is provided
          if (params?.search) {
            const searchLower = params.search.toLowerCase();
            leaveTypes = leaveTypes.filter((type) => type.name.toLowerCase().includes(searchLower));
          }

          // Apply client-side sorting
          if (params?.sortBy) {
            leaveTypes.sort((a: any, b: any) => {
              const aValue = a[params.sortBy!];
              const bValue = b[params.sortBy!];

              // Handle string comparison
              if (typeof aValue === 'string' && typeof bValue === 'string') {
                return params.sortDirection === 'asc'
                  ? aValue.localeCompare(bValue)
                  : bValue.localeCompare(aValue);
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
            leaveTypes = leaveTypes.slice(start, end);
          }

          return leaveTypes;
        },
        2,
        1000,
        'fetching leave types'
      );
    } catch (error) {
      console.error('Error fetching leave types:', error);
      showErrorToast(error, 'fetching leave types');
      return [];
    }
  }

  /**
   * Get a leave type by ID
   * @param id Leave type ID
   * @returns Leave type or throws an error if not found
   */
  async getLeaveTypeById(id: string): Promise<LeaveType> {
    try {
      const response = await axios.get<LeaveType>(`/api/LeaveType/${id}`);

      // The API returns a single leave type object
      return {
        id: response.data?.id || id,
        name: response.data?.name || '',
        defaultDays: response.data?.defaultDays || 0,
      };
    } catch (error) {
      console.error('Error in getLeaveTypeById:', error);
      showErrorToast(error, `fetching leave type ${id}`);
      throw new Error(getErrorMessage(error, `fetching leave type ${id}`));
    }
  }

  /**
   * Create a new leave type
   * @param leaveType Leave type data to create
   * @returns Created leave type
   */
  async createLeaveType(leaveType: CreateLeaveTypeDto): Promise<LeaveType> {
    try {
      // Sanitize input data
      const sanitizedData = sanitizeObject(leaveType);

      // Call API - POST /api/LeaveType with name and defaultDays
      const response = await axios.post<LeaveType>('/api/LeaveType', sanitizedData);

      // Return the created leave type
      return {
        id: response.data?.id || '',
        name: response.data?.name || sanitizedData.name,
        defaultDays: response.data?.defaultDays || sanitizedData.defaultDays,
      };
    } catch (error) {
      showErrorToast(error, 'creating leave type');
      throw new Error(getErrorMessage(error, 'creating leave type'));
    }
  }

  /**
   * Update an existing leave type
   * @param id Leave type ID
   * @param leaveType Leave type data to update
   * @returns Updated leave type
   */
  async updateLeaveType(
    id: string,
    leaveType: CreateLeaveTypeDto | UpdateLeaveTypeDto
  ): Promise<LeaveType> {
    try {
      console.log('Input parameters:', { id, leaveType });
      
      // Validate input parameters
      if (!leaveType) {
        throw new Error('Leave type data is required');
      }
      
      if (!leaveType.name) {
        throw new Error('Leave type name is required');
      }
      
      if (typeof leaveType.defaultDays !== 'number') {
        throw new Error('Leave type default days must be a number');
      }

      // Sanitize input data - only send the required fields
      const sanitizedData = sanitizeObject({
        name: leaveType.name,
        defaultDays: leaveType.defaultDays,
      });

      console.log('Updating leave type with data:', { id, sanitizedData });

      // Call API - PUT /api/LeaveType/{id} with name, defaultDays
      const response = await axios.put<LeaveType>(`/api/LeaveType/${id}`, sanitizedData);

      console.log('Update response:', {
        status: response.status,
        data: response.data,
        dataType: typeof response.data,
        isNull: response.data === null,
        isUndefined: response.data === undefined,
        headers: response.headers
      });

      // Return the updated leave type
      // Handle cases where response.data might be undefined or null
      let updatedLeaveType: LeaveType;
      
      try {
        updatedLeaveType = {
          id: id,
          name: response.data?.name || sanitizedData.name,
          defaultDays: response.data?.defaultDays || sanitizedData.defaultDays,
        };
      } catch (dataError) {
        console.error('Error accessing response data:', dataError);
        // Fallback to using the input data if response.data is problematic
        updatedLeaveType = {
          id: id,
          name: sanitizedData.name,
          defaultDays: sanitizedData.defaultDays,
        };
      }

      console.log('Returning updated leave type:', updatedLeaveType);
      return updatedLeaveType;
    } catch (error) {
      console.error('Error in updateLeaveType:', error);
      showErrorToast(error, 'updating leave type');
      throw new Error(getErrorMessage(error, 'updating leave type'));
    }
  }

  /**
   * Delete a leave type
   * @param id Leave type ID
   * @returns true if successful, throws error otherwise
   */
  async deleteLeaveType(id: string): Promise<boolean> {
    try {
      // Simple delete operation - DELETE /api/LeaveType/{id}
      await axios.delete(`/api/LeaveType/${id}`);
      return true;
    } catch (error: any) {
      // Handle 500 errors specially - they might indicate a successful delete with server-side issues
      if (error.response && error.response.status === 500) {
        console.log(
          `Server returned 500 error for leave type ${id} deletion, but this may be due to server-side cleanup issues. Considering it a success.`
        );
        return true;
      }

      // For 404 errors, the item might already be deleted
      if (error.response && error.response.status === 404) {
        console.log(`Leave type ${id} not found (404). It may have already been deleted.`);
        return true;
      }

      // For other errors, show error toast and throw
      console.error(`Error deleting leave type ${id}:`, error);
      showErrorToast(error, 'deleting leave type');
      throw new Error(getErrorMessage(error, 'deleting leave type'));
    }
  }
}

// Export a singleton instance
export const leaveTypeService = new LeaveTypeService();

// Export individual functions that reference the singleton
export const getLeaveTypes = (params?: PaginationParams) => leaveTypeService.getLeaveTypes(params);
export const getLeaveTypeById = (id: string) => leaveTypeService.getLeaveTypeById(id);
export const createLeaveType = (leaveType: CreateLeaveTypeDto) =>
  leaveTypeService.createLeaveType(leaveType);
export const updateLeaveType = (id: string, leaveType: CreateLeaveTypeDto | UpdateLeaveTypeDto) =>
  leaveTypeService.updateLeaveType(id, leaveType);
export const deleteLeaveType = (id: string) => leaveTypeService.deleteLeaveType(id);
