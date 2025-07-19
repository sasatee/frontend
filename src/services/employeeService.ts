import axios from '@/lib/axios';
import { sanitizeObject } from '@/lib/utils';
import { showErrorToast } from '@/lib/error-handler';
import { PaginationParams } from '@/hooks/usePaginatedData';
import { queryClient } from '@/lib/react-query';

// Type imports
import { Employee } from '@/types/employee';

export interface EmployeeDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  jobTitleId: string;
  departmentId: string;
  categoryGroupId?: string;
  nic?: string;
  gender?: 'Male' | 'Female' | 'Other';
  yearsOfService?: number;
  dateOfJoining?: string;
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  departmentId: string;
  jobTitleId: string;
  categoryGroupId: string;
  nic?: string;
  gender?: 'Male' | 'Female' | 'Other'; // Must be exactly "Male", "Female", or "Other"
  yearsOfService?: number; // Keep for backward compatibility
  yearOfService?: number; // Add this to match API expectation
  dateOfJoining?: string;
  postalCode?: string;
  city?: string;
  country?: string;
}

export interface UpdateEmployeeDto {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  yearOfService: number;
  jobTitle: string;
  postalCode?: string;
  city?: string;
  country?: string;
}

// Type for handling potential data wrapped in an object
interface EmployeeResponseWrapper {
  isSuccess?: boolean;
  message?: string;
  result?: Employee[] | Employee;
  employees?: Employee[];
  employeeCount?: number;
  employee?: Employee;
  id?: string;
  value?: {
    isSuccess?: boolean;
    message?: string;
    statusCode?: number;
  };
  [key: string]: any;
}

// Track ongoing requests to prevent duplicates
let isEmployeeRequestInProgress = false;
let lastRequestTime = 0;
const REQUEST_THROTTLE = 2000; // 2 seconds minimum between requests

export class EmployeeService {
  // Cache for employees to reduce API calls
  private employeesCache: Employee[] = [];
  private lastFetchTime: number = 0;
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes cache TTL

  constructor() {
    this.employeesCache = [];
    this.lastFetchTime = 0;
  }

  /**
   * Get all employees
   * @returns Array of all employees
   */
  async getAllEmployees(): Promise<Employee[]> {
    try {
      // Check if we have fresh cached data
      if (Array.isArray(this.employeesCache) && Date.now() - this.lastFetchTime < this.cacheTTL) {
        console.log(
          'Using cached employee data, cache age: ' +
            ((Date.now() - this.lastFetchTime) / 1000).toFixed(1) +
            's'
        );
        return this.employeesCache;
      }

      console.log('Fetching all employees...');

      const response = await axios.get('/api/Employee/all-employees');
      let employees: Employee[] = [];

      if (Array.isArray(response.data)) {
        employees = response.data;
      } else if (Array.isArray(response.data.result)) {
        employees = response.data.result;
      } else if (Array.isArray(response.data.employees)) {
        employees = response.data.employees;
      } else {
        // fallback: try to find the first array property
        const arr = Object.values(response.data).find((v) => Array.isArray(v));
        if (arr) employees = arr as Employee[];
      }

      this.employeesCache = employees;
      this.lastFetchTime = Date.now();

      console.log('All employees API response:', employees);
      return employees;
    } catch (error) {
      console.error('Error fetching all employees:', error);
      // Return empty array instead of throwing to prevent UI breakage
      return [];
    }
  }

  /**
   * Get an employee by ID
   * @param id Employee ID
   * @returns Employee or throws an error if not found
   */
  async getEmployee(id: string): Promise<Employee> {
    try {
      console.log('Fetching employee with ID:', id);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await axios.get<any>(`/api/Employee/${id}`, {
          signal: controller.signal,
        });

        console.log('Employee API response:', response.data);

        let employee: Employee;

        if (response.data && typeof response.data === 'object') {
          // Direct employee object
          if ('id' in response.data && 'firstName' in response.data) {
            employee = {
              ...response.data,
              yearsOfService: response.data.yearsOfService ?? 0,
              // Only set categoryGroupId if it's a valid non-empty string
              categoryGroupId:
                response.data.categoryGroupId && response.data.categoryGroupId !== ''
                  ? response.data.categoryGroupId
                  : null,
            };
          }
          // Wrapped in result property
          else if (
            (response.data as EmployeeResponseWrapper).result &&
            typeof (response.data as EmployeeResponseWrapper).result === 'object'
          ) {
            const result = (response.data as EmployeeResponseWrapper).result as Employee;
            employee = {
              ...result,
              yearsOfService: result.yearsOfService ?? 0,
              // Only set categoryGroupId if it's a valid non-empty string
              categoryGroupId:
                result.categoryGroupId && result.categoryGroupId !== ''
                  ? result.categoryGroupId
                  : null,
            };
          } else {
            throw new Error('Employee not found');
          }
        } else {
          throw new Error('Invalid response format');
        }

        console.log('Processed employee data:', employee);
        return employee;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      const errorDetails = showErrorToast(error, `fetching employee ${id}`);
      throw new Error(errorDetails.message);
    }
  }

  /**
   * Check if an employee with the given email already exists
   * @param email Email to check
   * @returns true if employee exists, false otherwise
   */
  async checkEmployeeExists(email: string): Promise<boolean> {
    try {
      // Try to use cached data if available and fresh
      if (Array.isArray(this.employeesCache) && Date.now() - this.lastFetchTime < this.cacheTTL) {
        return this.employeesCache.some((emp) => emp.email.toLowerCase() === email.toLowerCase());
      }

      // Fetch all employees if cache is stale or empty
      const employees = await this.getAllEmployees();
      return employees.some((emp) => emp.email.toLowerCase() === email.toLowerCase());
    } catch (error) {
      console.error('Error checking if employee exists:', error);
      return false; // Assume employee doesn't exist if there's an error
    }
  }

  /**
   * Create a new employee
   * @param data Employee data to create
   * @returns Created employee
   */
  async createEmployee(data: CreateEmployeeDto): Promise<Employee> {
    try {
      // Check if employee with same email already exists
      const emailExists = await this.checkEmployeeExists(data.email);
      if (emailExists) {
        throw new Error(`An employee with email ${data.email} already exists.`);
      }

      // Sanitize input data
      const sanitizedData = sanitizeObject(data);

      console.log('Creating employee with data:', sanitizedData);

      // Increase timeout to 30 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        // Log the exact request payload we're about to send
        const requestPayload = {
          jobTitleId: sanitizedData.jobTitleId,
          departmentId: sanitizedData.departmentId,
          address: sanitizedData.address || '',
          phone: sanitizedData.phone,
          email: sanitizedData.email,
          firstName: sanitizedData.firstName,
          lastName: sanitizedData.lastName,
          gender:
            sanitizedData.gender === 'Male' ||
            sanitizedData.gender === 'Female' ||
            sanitizedData.gender === 'Other'
              ? sanitizedData.gender
              : 'Male', // Must be exactly "Male", "Female", or "Other"
          nic: sanitizedData.nic || '',
          yearOfService: Number(sanitizedData.yearOfService || 0),
          categoryGroupId: sanitizedData.categoryGroupId || '',
        };

        console.log('Sending exact API request payload:', JSON.stringify(requestPayload, null, 2));
        console.log('API endpoint:', '/api/Employee/create-a-employee');

        // Log the headers we're sending
        const headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        };
        console.log('Request headers:', headers);

        // Call API using the exact endpoint from the API documentation
        const response = await axios.post<EmployeeResponseWrapper>(
          '/api/Employee/create-a-employee',
          requestPayload, // Don't stringify - axios does this automatically
          {
            signal: controller.signal,
            headers: headers,
          }
        );

        console.log('Create employee API response status:', response.status);
        console.log('Create employee API response headers:', response.headers);
        console.log('Create employee API response data:', response.data);

        // Return the input data as the created employee if successful
        // This is because the API returns 200 but doesn't return the created employee
        if (response.status === 200) {
          // Create an employee object from the input data
          const createdEmployee: Employee = {
            id: response.data?.id || '', // Try to get ID from response if available
            firstName: sanitizedData.firstName,
            lastName: sanitizedData.lastName,
            email: sanitizedData.email,
            phone: sanitizedData.phone || '',
            address: sanitizedData.address || '',
            departmentId: sanitizedData.departmentId,
            jobTitleId: sanitizedData.jobTitleId,
            categoryGroupId: sanitizedData.categoryGroupId || '',
            dateOfJoining: sanitizedData.dateOfJoining || new Date().toISOString(),
            dateOfLeaving: '',
            appUserId: '',
            nic: sanitizedData.nic || '',
            yearsOfService: sanitizedData.yearsOfService || 0,
            gender: (sanitizedData.gender as 'Male' | 'Female' | 'Other') || 'Male',
          };

          console.log('Created employee object:', createdEmployee);
          return createdEmployee;
        }

        throw new Error(`Failed to create employee. Status: ${response.status}`);
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error: any) {
      console.error('Error creating employee:', error);

      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        throw new Error('Request timed out. Please try again.');
      }

      // Handle API error responses
      if (error.response) {
        console.error('API error response status:', error.response.status);
        console.error('API error response headers:', error.response.headers);
        console.error('API error response data:', error.response.data);

        const errorMessage =
          error.response.data?.message ||
          error.response.data?.value?.message ||
          error.response.data?.error ||
          `Failed to create employee (Status: ${error.response.status})`;

        throw new Error(errorMessage);
      }

      throw error;
    }
  }

  /**
   * Update an existing employee
   * @param id Employee ID
   * @param data Employee data to update
   * @returns Updated employee
   */
  async updateEmployee(id: string, data: UpdateEmployeeDto): Promise<Employee> {
    try {
      // Sanitize input data
      const sanitizedData = sanitizeObject(data);

      console.log('Updating employee with data:', sanitizedData);

      // Create the exact payload structure expected by the API
      const requestPayload = {
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
        phone: sanitizedData.phone,
        address: sanitizedData.address,
        yearOfService: Number(sanitizedData.yearOfService || 0),
        jobTitle: sanitizedData.jobTitle,
      };

      console.log('Sending exact API request payload:', JSON.stringify(requestPayload, null, 2));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await axios.put<EmployeeResponseWrapper>(
          `/api/Employee/${id}`,
          requestPayload,
          {
            signal: controller.signal,
          }
        );

        console.log('Update employee API response:', response);

        if (response.status === 200) {
          // If the API doesn't return the updated employee, create one from request data
          // merged with the existing employee data
          const existingEmployee = await this.getEmployee(id);
          const updatedEmployee: Employee = {
            ...existingEmployee,
            firstName: sanitizedData.firstName,
            lastName: sanitizedData.lastName,
            phone: sanitizedData.phone,
            address: sanitizedData.address,
            yearsOfService: Number(sanitizedData.yearOfService || 0),
          };

          return updatedEmployee;
        }

        throw new Error('Failed to update employee');
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error: any) {
      console.error('Error updating employee:', error);

      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        throw new Error('Request timed out. Please try again.');
      }

      // Handle API error responses
      if (error.response) {
        console.error('API error response status:', error.response.status);
        console.error('API error response headers:', error.response.headers);
        console.error('API error response data:', error.response.data);

        const errorMessage =
          error.response.data?.message ||
          error.response.data?.value?.message ||
          error.response.data?.error ||
          `Failed to update employee (Status: ${error.response.status})`;

        throw new Error(errorMessage);
      }

      const errorDetails = showErrorToast(error, 'updating employee');
      throw new Error(errorDetails.message);
    }
  }

  /**
   * Delete an employee
   * @param id Employee ID
   */
  async deleteEmployee(id: string): Promise<void> {
    try {
      await axios.delete(`/api/Employee/${id}`);
    } catch (error) {
      const errorDetails = showErrorToast(error, `deleting employee ${id}`);
      throw new Error(errorDetails.message);
    }
  }
}

export const employeeService = new EmployeeService();

// Export functions for direct use
export const getAllEmployees = () => employeeService.getAllEmployees();
export const getEmployee = (id: string) => employeeService.getEmployee(id);
export const createEmployee = (data: CreateEmployeeDto) => employeeService.createEmployee(data);
export const updateEmployee = (id: string, data: UpdateEmployeeDto) =>
  employeeService.updateEmployee(id, data);
export const deleteEmployee = (id: string) => employeeService.deleteEmployee(id);
