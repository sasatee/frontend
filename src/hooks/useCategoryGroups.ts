// @ts-ignore
import { usePaginatedData } from './usePaginatedData';
import {
  getCategoryGroups,
  createCategoryGroup,
  updateCategoryGroup,
  deleteCategoryGroup,
} from '@/services/categoryGroupService';
import {
  CategoryGroup,
  CreateCategoryGroupDto,
  UpdateCategoryGroupDto,
  SalaryProgressionResponse,
} from '@/types/categoryGroup';
import { useQuery } from '@tanstack/react-query';

interface UpdateCategoryGroupInput extends UpdateCategoryGroupDto {
  id: string;
}

export const useCategoryGroups = (initialParams = {}) => {
  return usePaginatedData<CategoryGroup, CreateCategoryGroupDto, UpdateCategoryGroupInput>({
    queryKey: 'categoryGroups',
    fetchFn: getCategoryGroups,
    createFn: (data) => createCategoryGroup(data),
    updateFn: (data) => updateCategoryGroup(data.id, { name: data.name }),
    deleteFn: deleteCategoryGroup,
    idField: 'id',
    initialParams: {
      sortBy: 'name',
      sortDirection: 'asc',
      ...initialParams,
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - increased from 5 minutes
    cacheTime: 60 * 60 * 1000, // 60 minutes - increased from 10 minutes
  });
};
