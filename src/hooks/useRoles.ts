import { usePaginatedData } from './usePaginatedData';
import { roleService, Role } from '@/services/roleService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

interface UpdateRoleInput {
  id: string;
  roleName: string;
}

export const useRoles = (initialParams = {}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const paginatedData = usePaginatedData<Role, string, UpdateRoleInput>({
    queryKey: 'roles',
    fetchFn: roleService.getRoles.bind(roleService),
    createFn: (roleName) => roleService.createRole(roleName),
    updateFn: (data) => roleService.updateRole(data.id, data.roleName),
    deleteFn: roleService.deleteRole.bind(roleService),
    idField: 'id',
    initialParams: {
      sortBy: 'name',
      sortDirection: 'asc',
      ...initialParams,
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const createRole = useMutation({
    mutationFn: roleService.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: 'Success',
        description: 'Role created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to create role: ${error.message}`,
      });
    },
  });

  const updateRole = useMutation({
    mutationFn: ({ id, roleName }: UpdateRoleInput) => roleService.updateRole(id, roleName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: 'Success',
        description: 'Role updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to update role: ${error.message}`,
      });
    },
  });

  const deleteRole = useMutation({
    mutationFn: roleService.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: 'Success',
        description: 'Role deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to delete role: ${error.message}`,
      });
    },
  });

  const assignRole = useMutation({
    mutationFn: roleService.assignRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: 'Success',
        description: 'Role assigned successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to assign role: ${error.message}`,
      });
    },
  });

  return {
    ...paginatedData,
    createRole,
    updateRole,
    deleteRole,
    assignRole,
  };
};
