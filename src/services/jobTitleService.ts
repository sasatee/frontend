import axios from '@/lib/axios';
import { AxiosError } from 'axios';
import { JobTitle, CreateJobTitleDto, UpdateJobTitleDto } from '../types/jobTitle';
import { showErrorToast, retryOperation, getErrorMessage } from '@/lib/error-handler';
import { sanitizeObject } from '@/lib/utils';

export class JobTitleService {
  private readonly baseUrl = '/api/JobTitle';

  /**
   * Get all job titles
   * @returns Array of job titles
   */
  async getAllJobTitles(): Promise<JobTitle[]> {
    try {
      return await retryOperation(
        async () => {
          const response = await axios.get<JobTitle[]>(this.baseUrl);

          // Ensure we return an array
          if (!response.data) {
            return [];
          }

          // Handle array response directly
          if (Array.isArray(response.data)) {
            return response.data.map((job) => ({
              id: job.id || '',
              title: job.title || '',
            }));
          }

          // Return empty array as fallback
          return [];
        },
        2,
        1000,
        'fetching job titles'
      );
    } catch (error) {
      showErrorToast(error, 'fetching job titles');
      return [];
    }
  }

  /**
   * Create a new job title
   * @param jobTitle Job title data to create
   * @returns Created job title
   */
  async createJobTitle(jobTitle: CreateJobTitleDto): Promise<JobTitle> {
    try {
      // Sanitize input data and ensure it matches API structure
      const sanitizedData = sanitizeObject({
        title: jobTitle.title,
      });

      const response = await axios.post<JobTitle>(this.baseUrl, sanitizedData);

      if (!response.data) {
        throw new Error('Invalid response from server');
      }

      return response.data;
    } catch (error) {
      showErrorToast(error, 'creating job title');
      const errorMessage = getErrorMessage(error, 'creating job title');
      throw new Error(errorMessage);
    }
  }

  /**
   * Get a job title by ID
   * @param id Job title ID
   * @returns Job title or throws an error if not found
   */
  async getJobTitleById(id: string): Promise<JobTitle> {
    try {
      if (!id) {
        throw new Error('Job title ID is required');
      }

      const response = await axios.get<JobTitle>(`${this.baseUrl}/${id}`);

      if (!response.data) {
        throw new Error('Job title not found');
      }

      return response.data;
    } catch (error) {
      showErrorToast(error, `fetching job title ${id}`);
      const errorMessage = getErrorMessage(error, `fetching job title ${id}`);
      throw new Error(errorMessage);
    }
  }

  /**
   * Update an existing job title
   * @param id Job title ID
   * @param jobTitle Job title data to update
   * @returns Updated job title
   */
  async updateJobTitle(id: string, jobTitle: UpdateJobTitleDto): Promise<JobTitle> {
    try {
      if (!id) {
        throw new Error('Job title ID is required');
      }

      // Sanitize input data and ensure it matches API structure
      const sanitizedData = sanitizeObject({
        title: jobTitle.title,
      });

      const response = await axios.put<JobTitle>(`${this.baseUrl}/${id}`, sanitizedData);

      if (!response.data) {
        throw new Error('Invalid response from server');
      }

      return response.data;
    } catch (error) {
      showErrorToast(error, 'updating job title');
      const errorMessage = getErrorMessage(error, 'updating job title');
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete a job title
   * @param id Job title ID
   */
  async deleteJobTitle(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Job title ID is required');
      }

      await axios.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      showErrorToast(error, `deleting job title ${id}`);
      const errorMessage = getErrorMessage(error, `deleting job title ${id}`);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get job title associated with an employee
   * @param employeeId Employee ID
   * @returns Job title or null if not found
   */
  async getJobTitleByEmployee(employeeId: string): Promise<JobTitle | null> {
    try {
      if (!employeeId) {
        throw new Error('Employee ID is required');
      }

      const response = await axios.get<JobTitle>(
        `${this.baseUrl}/JobAssociateWithEmployee/${employeeId}`
      );

      if (!response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      // This endpoint might return 404 if no job title is associated
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      showErrorToast(error, `fetching job title for employee ${employeeId}`);
      return null;
    }
  }
}

// Export a singleton instance
export const jobTitleService = new JobTitleService();

// Export convenience functions with proper typing
export const getAllJobTitles = () => jobTitleService.getAllJobTitles();

export const getJobTitleById = (id: string) => jobTitleService.getJobTitleById(id);

export const createJobTitle = (jobTitle: CreateJobTitleDto) =>
  jobTitleService.createJobTitle(jobTitle);

export const updateJobTitle = (id: string, jobTitle: UpdateJobTitleDto) =>
  jobTitleService.updateJobTitle(id, jobTitle);

export const deleteJobTitle = (id: string) => jobTitleService.deleteJobTitle(id);

export const getJobTitleByEmployee = (employeeId: string) =>
  jobTitleService.getJobTitleByEmployee(employeeId);
