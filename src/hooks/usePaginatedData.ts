import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from './useDebounce';

export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface UsePaginatedDataOptions<T, TCreateInput, TUpdateInput> {
  queryKey: string;
  fetchFn: (params: PaginationParams) => Promise<T[]>;
  createFn?: (data: TCreateInput) => Promise<T>;
  updateFn?: (data: TUpdateInput) => Promise<T>;
  deleteFn?: (id: string) => Promise<void>;
  idField?: keyof T;
  initialParams?: Partial<PaginationParams>;
  transformResponse?: (data: T[]) => PaginatedResponse<T>;
  onMutationSuccess?: () => void;
  staleTime?: number; // in milliseconds
  cacheTime?: number; // in milliseconds
}

export function usePaginatedData<T, TCreateInput = any, TUpdateInput = any>(
  options: UsePaginatedDataOptions<T, TCreateInput, TUpdateInput>
) {
  const {
    queryKey,
    fetchFn,
    createFn,
    updateFn,
    deleteFn,
    idField = 'id' as keyof T,
    initialParams = {},
    transformResponse,
    onMutationSuccess,
    staleTime = 10 * 1000, // Reduced from 5 minutes to 10 seconds
    cacheTime = 5 * 60 * 1000, // Reduced from 10 minutes to 5 minutes
  } = options;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Pagination state
  const [params, setParams] = useState<PaginationParams>({
    page: initialParams.page || 1,
    pageSize: initialParams.pageSize || 10,
    search: initialParams.search || '',
    sortBy: initialParams.sortBy,
    sortDirection: initialParams.sortDirection || 'asc',
  });

  // Debounce search term to avoid excessive API calls
  const debouncedSearch = useDebounce(params.search, 300);

  // Create the final params with debounced search
  const finalParams = {
    ...params,
    search: debouncedSearch,
  };

  // Fetch data with React Query
  const {
    data: rawData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [queryKey, finalParams],
    queryFn: () => fetchFn(finalParams),
    staleTime,
    gcTime: cacheTime,
    refetchOnWindowFocus: true, // Enable refetching when window regains focus
    refetchOnMount: true, // Refetch when component mounts
  });

  // Force refresh function for immediate data refresh
  const forceRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [queryKey] });
    return refetch();
  }, [queryKey, queryClient, refetch]);

  // Removed auto-refresh interval as it's not necessary and could cause performance issues

  // Transform the response if needed
  const data = transformResponse
    ? transformResponse(rawData || [])
    : {
        items: rawData || [],
        totalItems: (rawData || []).length || 0,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(((rawData || []).length || 0) / params.pageSize),
      };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createFn,
    onSuccess: async (newItem) => {
      // Optimistic update
      queryClient.setQueryData([queryKey, finalParams], (oldData: T[] = []) => {
        return [...oldData, newItem];
      });

      // Immediately invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
      await refetch();

      toast({
        title: 'Success',
        description: 'Item created successfully',
      });

      if (onMutationSuccess) {
        onMutationSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to create item: ${error.message}`,
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateFn,
    onMutate: async (updatedItem: any) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [queryKey, finalParams] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([queryKey, finalParams]);

      // Optimistically update to the new value
      queryClient.setQueryData([queryKey, finalParams], (oldData: T[] = []) => {
        return oldData.map((item) =>
          item[idField] === updatedItem[idField] ? { ...item, ...updatedItem } : item
        );
      });

      return { previousData };
    },
    onSuccess: async () => {
      // Immediately invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
      await refetch();

      toast({
        title: 'Success',
        description: 'Item updated successfully',
      });

      if (onMutationSuccess) {
        onMutationSuccess();
      }
    },
    onError: (error: Error, _, context: any) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData([queryKey, finalParams], context.previousData);
      }

      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to update item: ${error.message}`,
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [queryKey, finalParams] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([queryKey, finalParams]);

      // Optimistically update by removing the deleted item
      queryClient.setQueryData([queryKey, finalParams], (oldData: T[] = []) => {
        return oldData.filter((item) => String(item[idField]) !== id);
      });

      return { previousData };
    },
    onSuccess: async () => {
      // Immediately invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
      await refetch();

      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });

      if (onMutationSuccess) {
        onMutationSuccess();
      }
    },
    onError: (error: Error, _, context: any) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData([queryKey, finalParams], context.previousData);
      }

      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to delete item: ${error.message}`,
      });
    },
  });

  // Update page
  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  // Update page size
  const setPageSize = useCallback((pageSize: number) => {
    setParams((prev) => ({ ...prev, pageSize, page: 1 }));
  }, []);

  // Update search term
  const setSearchTerm = useCallback((search: string) => {
    setParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  // Update sort
  const setSort = useCallback((sortBy: string, sortDirection: 'asc' | 'desc') => {
    setParams((prev) => ({ ...prev, sortBy, sortDirection }));
  }, []);

  // Reset all params
  const resetParams = useCallback(() => {
    setParams({
      page: initialParams.page || 1,
      pageSize: initialParams.pageSize || 10,
      search: initialParams.search || '',
      sortBy: initialParams.sortBy,
      sortDirection: initialParams.sortDirection || 'asc',
    });
  }, [initialParams]);

  // Refetch when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== params.search) {
      refetch();
    }
  }, [debouncedSearch, params.search, refetch]);

  return {
    // Data
    data: data.items,
    totalItems: data.totalItems,
    page: data.page,
    pageSize: data.pageSize,
    totalPages: data.totalPages,

    // Loading states
    isLoading,
    isError,
    error,
    isFetching,

    // Pagination controls
    setPage,
    setPageSize,
    setSearchTerm,
    setSort,
    resetParams,

    // Search
    searchTerm: params.search || '',
    debouncedSearch,

    // Sort
    sortBy: params.sortBy,
    sortDirection: params.sortDirection,

    // Mutations
    createItem: createMutation.mutate,
    updateItem: updateMutation.mutate,
    deleteItem: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Refetch
    refetch,

    // Force refresh
    forceRefresh,
  };
}
