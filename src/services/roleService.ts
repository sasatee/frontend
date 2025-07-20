// @ts-ignore
import axios from '@/lib/axios';
import { showErrorToast, retryOperation, getErrorMessage } from '@/lib/error-handler';
import { sanitizeObject } from '@/lib/utils';

export interface Role {
  id: string;
  name: string;
  totalUsers: number;
}

export interface RoleAssignment {
  userId: string;
  roleId: string;
}

export interface RoleCreateResponse {
  success: boolean;
  role: Role;
  message?: string;
}

export interface RoleUpdateResponse {
  success: boolean;
  role: Role;
  message?: string;
}

export interface RolesResponse {
  success: boolean;
  data: Role[];
  message?: string;
  [key: string]: unknown;
}

// Type for handling potential data wrapped in an object
interface RoleResponseWrapper {
  isSuccess?: boolean;
  message?: string;
  result?: Role[] | Role;
  data?: Role[];
  [key: string]: any;
}

export class RoleService {
  private readonly headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  /**
   * Get all roles
   * @returns Array of roles
   */
  async getRoles(): Promise<Role[]> {
    try {
      return await retryOperation(
        async () => {
          const response = await axios.get<RoleResponseWrapper>('/api/Roles');

          // Process the API response
          let roles: Role[] = [];

          if (!response.data) {
            return [];
          }

          // Handle different response formats
          if (Array.isArray(response.data)) {
            roles = response.data;
          } else if (typeof response.data === 'object' && response.data !== null) {
            // Check if data is wrapped in a result or data property
            if (response.data.result && Array.isArray(response.data.result)) {
              roles = response.data.result;
            } else if (response.data.data && Array.isArray(response.data.data)) {
              roles = response.data.data;
            } else if (response.data.result && typeof response.data.result === 'object') {
              roles = [response.data.result as Role];
            } else {
              // Try to find an array property
              for (const [key, value] of Object.entries(response.data)) {
                if (Array.isArray(value)) {
                  roles = value;
                  break;
                }
              }
            }
          }

          return roles || [];
        },
        2,
        1000,
        'fetching roles'
      );
    } catch (error) {
      showErrorToast(error, 'fetching roles');
      return [];
    }
  }

  /**
   * Get a role by ID
   * @param id Role ID
   * @returns Role or throws an error if not found
   */
  async getRole(id: string): Promise<Role> {
    try {
      const response = await axios.get<RoleResponseWrapper>(`/api/Roles/${id}`);

      let role: Role;

      if (response.data.result) {
        role = response.data.result as Role;
      } else if (response.data.id) {
        role = response.data as Role;
      } else {
        throw new Error('Role not found');
      }

      return role;
    } catch (error) {
      showErrorToast(error, `fetching role ${id}`);
      throw new Error(getErrorMessage(error, `fetching role ${id}`));
    }
  }

  /**
   * Create a new role
   * @param roleName Role name to create
   * @returns Created role
   */
  async createRole(roleName: string): Promise<Role> {
    try {
      // Sanitize input data
      const sanitizedData = sanitizeObject({ roleName });

      // Call API
      const response = await axios.post<RoleResponseWrapper>('/api/Roles', sanitizedData);

      // Extract role from response
      let createdRole: Role;

      if (response.data.result) {
        createdRole = response.data.result as Role;
      } else if (response.data.id) {
        createdRole = response.data as Role;
      } else {
        // If the API doesn't return the created role, create one from request data
        createdRole = {
          id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: roleName,
          totalUsers: 0,
        };
      }

      return createdRole;
    } catch (error) {
      showErrorToast(error, 'creating role');
      throw new Error(getErrorMessage(error, 'creating role'));
    }
  }

  /**
   * Update an existing role
   * @param id Role ID
   * @param roleName New role name
   * @returns Updated role
   */
  async updateRole(id: string, roleName: string): Promise<Role> {
    try {
      // Sanitize input data
      const sanitizedData = sanitizeObject({ roleName });

      // Call API
      const response = await axios.put<RoleResponseWrapper>(`/api/Roles/${id}`, sanitizedData);

      // Extract updated role from response
      let updatedRole: Role;

      if (response.data.result) {
        updatedRole = response.data.result as Role;
      } else if (response.data.id) {
        updatedRole = response.data as Role;
      } else {
        // If the API doesn't return the updated role, create one from request data
        updatedRole = {
          id,
          name: roleName,
          totalUsers: 0,
        };
      }

      return updatedRole;
    } catch (error) {
      showErrorToast(error, 'updating role');
      throw new Error(getErrorMessage(error, 'updating role'));
    }
  }

  /**
   * Delete a role
   * @param id Role ID
   */
  async deleteRole(id: string): Promise<void> {
    try {
      await axios.delete(`/api/Roles/${id}`);
    } catch (error) {
      showErrorToast(error, `deleting role ${id}`);
      throw new Error(getErrorMessage(error, `deleting role ${id}`));
    }
  }

  /**
   * Assign a role to a user
   * @param assignment Role assignment data
   */
  async assignRole(assignment: RoleAssignment): Promise<void> {
    try {
      // Sanitize input data
      const sanitizedData = sanitizeObject(assignment);

      await axios.post('/api/Roles/assign', sanitizedData);
    } catch (error) {
      showErrorToast(error, 'assigning role');
      throw new Error(getErrorMessage(error, 'assigning role'));
    }
  }
}

export const roleService = new RoleService();

// Export functions for direct use
export const getRoles = () => roleService.getRoles();
export const getRole = (id: string) => roleService.getRole(id);
export const createRole = (roleName: string) => roleService.createRole(roleName);
export const updateRole = (id: string, roleName: string) => roleService.updateRole(id, roleName);
export const deleteRole = (id: string) => roleService.deleteRole(id);
export const assignRole = (assignment: RoleAssignment) => roleService.assignRole(assignment);
