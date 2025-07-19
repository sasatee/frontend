import axios from '@/lib/axios';
import {
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentApiResponse,
  SingleDepartmentApiResponse,
} from '@/types/department';
import { showErrorToast, retryOperation, getErrorMessage } from '@/lib/error-handler';
import { sanitizeObject } from '@/lib/utils';

export class DepartmentService {
  private readonly baseUrl = '/api/Department';

  /**
   * Get all departments
   * @returns Array of departments
   */
  async getDepartments(): Promise<Department[]> {
    try {
      return await retryOperation(
        async () => {
          const response = await axios.get<DepartmentApiResponse>(this.baseUrl);

          // Handle wrapped API response
          if (!response.data) {
            console.warn('No response data received');
            return [];
          }

          // Check if response is successful
          if (!response.data.isSuccess) {
            console.error('API returned unsuccessful response:', response.data.message);
            throw new Error(response.data.message || 'Failed to fetch departments');
          }

          // Return the result array
          const departments = response.data.result || [];

          const mappedDepartments = departments.map((dept) => ({
            id: dept.id || '',
            departmentName: dept.departmentName || '',
            headOfDepartment: dept.headOfDepartment || '',
          }));

          return mappedDepartments;
        },
        2,
        1000,
        'fetching departments'
      );
    } catch (error) {
      console.error('Error fetching departments:', error);
      showErrorToast(error, 'fetching departments');
      return [];
    }
  }

  /**
   * Get a department by ID
   * @param id Department ID
   * @returns Department or throws an error if not found
   */
  async getDepartmentById(id: string): Promise<Department> {
    try {
      if (!id) {
        throw new Error('Department ID is required');
      }

      const response = await axios.get<SingleDepartmentApiResponse>(`${this.baseUrl}/${id}`);

      if (!response.data) {
        throw new Error('Department not found');
      }

      // Check if response is successful
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Failed to fetch department');
      }

      if (!response.data.result) {
        throw new Error('Department not found');
      }

      return response.data.result;
    } catch (error) {
      showErrorToast(error, `fetching department ${id}`);
      const errorMessage = getErrorMessage(error, `fetching department ${id}`);
      throw new Error(errorMessage);
    }
  }

  /**
   * Create a new department
   * @param department Department data to create
   * @returns Created department
   */
  async createDepartment(department: CreateDepartmentDto): Promise<Department> {
    try {
      // Sanitize input data and ensure it matches API structure
      const sanitizedData = sanitizeObject({
        departmentName: department.departmentName,
        headOfDepartment: department.headOfDepartment,
      });

      const response = await axios.post<SingleDepartmentApiResponse>(this.baseUrl, sanitizedData);

      if (!response.data) {
        throw new Error('Invalid response from server');
      }

      // Check if response is successful
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Failed to create department');
      }

      if (!response.data.result) {
        throw new Error('Invalid response from server');
      }

      return response.data.result;
    } catch (error) {
      showErrorToast(error, 'creating department');
      const errorMessage = getErrorMessage(error, 'creating department');
      throw new Error(errorMessage);
    }
  }

  /**
   * Update an existing department
   * @param id Department ID
   * @param department Department data to update
   * @returns Updated department
   */
  async updateDepartment(id: string, department: UpdateDepartmentDto): Promise<Department> {
    try {
      if (!id) {
        throw new Error('Department ID is required');
      }

      // Sanitize input data and ensure it matches API structure
      const sanitizedData = sanitizeObject({
        departmentName: department.departmentName,
        headOfDepartment: department.headOfDepartment,
      });

      const response = await axios.put<SingleDepartmentApiResponse>(
        `${this.baseUrl}/${id}`,
        sanitizedData
      );

      if (!response.data) {
        throw new Error('Invalid response from server');
      }

      // Check if response is successful
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Failed to update department');
      }

      if (!response.data.result) {
        throw new Error('Invalid response from server');
      }

      return response.data.result;
    } catch (error) {
      showErrorToast(error, 'updating department');
      const errorMessage = getErrorMessage(error, 'updating department');
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete a department
   * @param id Department ID
   */
  async deleteDepartment(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Department ID is required');
      }

      await axios.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      showErrorToast(error, `deleting department ${id}`);
      const errorMessage = getErrorMessage(error, `deleting department ${id}`);
      throw new Error(errorMessage);
    }
  }
}

// Export a singleton instance
export const departmentService = new DepartmentService();

// Export convenience functions with proper typing
export const getDepartments = () => departmentService.getDepartments();

export const getDepartmentById = (id: string) => departmentService.getDepartmentById(id);

export const createDepartment = (department: CreateDepartmentDto) =>
  departmentService.createDepartment(department);

export const updateDepartment = (id: string, department: UpdateDepartmentDto) =>
  departmentService.updateDepartment(id, department);

export const deleteDepartment = (id: string) => departmentService.deleteDepartment(id);
