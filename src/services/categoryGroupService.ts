// @ts-ignore
import axios from '@/lib/axios';
import { showErrorToast } from '@/lib/error-handler';
import {
  CategoryGroup,
  CreateCategoryGroupDto,
  UpdateCategoryGroupDto,
} from '@/types/categoryGroup';
import { PaginationParams } from '@/hooks/usePaginatedData';
import { sanitizeObject } from '@/lib/utils';

export class CategoryGroupService {
  /**
   * Get all category groups
   * @param params Pagination and filtering parameters
   * @returns Array of category groups
   */
  async getCategoryGroups(params?: PaginationParams): Promise<CategoryGroup[]> {
    try {
      const response = await axios.get<CategoryGroup[]>('/api/CategoryGroup');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching category groups:', error);
      showErrorToast(error, 'fetching category groups');
      return [];
    }
  }

  /**
   * Get a category group by ID
   * @param id Category group ID
   * @returns Category group or null if not found
   */
  async getCategoryGroup(id: string): Promise<CategoryGroup | null> {
    try {
      console.log('Fetching category group with ID:', id);

      // Use GET method as POST is not allowed
      const response = await axios.get<CategoryGroup>(`/api/CategoryGroup/${id}`);

      if (!response.data) {
        console.warn('No data returned for category group:', id);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching category group:', error);
      showErrorToast(error, 'fetching category group');
      return null;
    }
  }

  /**
   * Create a new category group
   * @param data Category group data
   * @returns Created category group
   */
  async createCategoryGroup(data: CreateCategoryGroupDto): Promise<CategoryGroup> {
    try {
      const sanitizedData = sanitizeObject(data);
      const response = await axios.post<CategoryGroup>('/api/CategoryGroup', sanitizedData);

      if (!response.data) {
        throw new Error('No data returned from create operation');
      }

      return response.data;
    } catch (error) {
      console.error('Error creating category group:', error);
      showErrorToast(error, 'creating category group');
      throw error;
    }
  }

  /**
   * Update an existing category group
   * @param id Category group ID
   * @param data Category group data
   * @returns Updated category group
   */
  async updateCategoryGroup(id: string, data: UpdateCategoryGroupDto): Promise<CategoryGroup> {
    try {
      const sanitizedData = sanitizeObject(data);
      const response = await axios.put<CategoryGroup>(`/api/CategoryGroup/${id}`, sanitizedData);

      if (!response.data) {
        throw new Error('No data returned from update operation');
      }

      return response.data;
    } catch (error) {
      console.error('Error updating category group:', error);
      showErrorToast(error, 'updating category group');
      throw error;
    }
  }

  /**
   * Delete a category group
   * @param id Category group ID
   */
  async deleteCategoryGroup(id: string): Promise<void> {
    try {
      await axios.delete(`/api/CategoryGroup/${id}`);
    } catch (error) {
      console.error('Error deleting category group:', error);
      showErrorToast(error, 'deleting category group');
      throw error;
    }
  }
}

export const categoryGroupService = new CategoryGroupService();

// Export functions for direct use
export const getCategoryGroups = (params?: PaginationParams) =>
  categoryGroupService.getCategoryGroups(params);
export const getCategoryGroup = (id: string) => categoryGroupService.getCategoryGroup(id);
export const createCategoryGroup = (data: CreateCategoryGroupDto) =>
  categoryGroupService.createCategoryGroup(data);
export const updateCategoryGroup = (id: string, data: UpdateCategoryGroupDto) =>
  categoryGroupService.updateCategoryGroup(id, data);
export const deleteCategoryGroup = (id: string) => categoryGroupService.deleteCategoryGroup(id);
