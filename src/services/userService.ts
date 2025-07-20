import axios from '@/lib/axios';

export interface UserDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  phoneNumber: string;
  twoFactorEnabled: boolean;
  phoneNumberConfirmed: boolean;
  accessFailedCount: number;
  appUserId: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const userService = {
  getUserDetails: async (): Promise<UserDetails> => {
    try {
      const response = await axios.get<any>('/api/Account/detail');
      console.log('User details API response:', response.data);

      // Check if the response has the expected structure
      if (response.data && typeof response.data === 'object') {
        // If response.data is directly a user object (not wrapped in data property)
        if (response.data.id && response.data.email) {
          return response.data as UserDetails;
        }

        // If response uses success property
        else if (response.data.success !== undefined) {
          if (response.data.success === false) {
            throw new Error(response.data.message || 'Failed to fetch user details');
          }
          return response.data.data || response.data;
        }

        // If response has data property directly
        else if (response.data.data) {
          return response.data.data;
        }
      }

      throw new Error('Failed to fetch user details');
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw new Error('Failed to fetch user details');
    }
  },

  updateUserDetails: async (data: Partial<UserDetails>): Promise<void> => {
    try {
      const response = await axios.put<ApiResponse<void>>('/api/Account/update', data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update user details');
      }
    } catch (error) {
      console.error('Error updating user details:', error);
      throw error;
    }
  },

  getAllUsers: async (): Promise<UserDetails[]> => {
    try {
      // Use the details endpoint (plural) for getting multiple users
      const response = await axios.get<any>('/api/Account/details');
      console.log('Users API response (details):', response.data);

      // Check if the response has the expected structure
      if (response.data && typeof response.data === 'object') {
        // Case 1: Response with users array (based on API structure)
        if (response.data.users && Array.isArray(response.data.users)) {
          return response.data.users as UserDetails[];
        }

        // Case 2: Direct array response
        else if (Array.isArray(response.data)) {
          return response.data as UserDetails[];
        }

        // Case 3: With success property
        else if (response.data.success !== undefined) {
          // Only throw if success is explicitly false
          if (response.data.success === false) {
            throw new Error(response.data.message || 'Failed to fetch users');
          }
          return response.data.data || response.data.users || [];
        }

        // Case 4: With data property directly
        else if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }

        // Case 5: Single user response - wrap in array (fallback)
        else if (response.data.id && response.data.email) {
          return [response.data as UserDetails];
        }
      }

      return [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return []; // Return empty array instead of throwing
    }
  },
};
