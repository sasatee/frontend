import axios from '@/lib/axios';
import { showErrorToast } from '@/lib/error-handler';
import { jwtDecode } from 'jwt-decode';

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
  profileImage?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roles: string[];
}

interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  result?: T;
  token?: string;
  refreshToken?: string;
  roles?: string[];
}

interface LoginResponse {
  token: string;
  refreshToken: string;
}

interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

interface ChangePasswordRequest {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword?: string;
}

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

// Helper function to extract data from various API response formats
const extractResponseData = <T>(response: any): T => {
  try {
    // Direct result
    if (response.data && typeof response.data === 'object') {
      // If data is directly the expected type
      if (response.data.id || response.data.token || response.data.isSuccess !== undefined) {
        return response.data as T;
      }

      // If data is in result property
      if (response.data.result && typeof response.data.result === 'object') {
        return response.data.result as T;
      }

      // If token is directly in response.data
      if (response.data.token) {
        return response.data as T;
      }

      // If the response data itself is the expected type
      if (Object.keys(response.data).length > 0) {
        return response.data as T;
      }
    }

    // If we have a response but couldn't extract data in a known format,
    // return an empty object as fallback (better than failing)
    console.warn('Could not extract data in a known format, using fallback', response);
    return {} as T;
  } catch (error) {
    console.error('Error extracting data from response:', error, response);
    throw new Error('Failed to extract data from response');
  }
};

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await axios.post<ApiResponse<LoginResponse>>(
        '/api/Account/login',
        credentials
      );

      // Check if the response indicates failure
      if (response.data && response.data.isSuccess === false) {
        throw new Error(response.data.message || 'Login failed');
      }

      // Extract token from response
      let token = '';
      let refreshToken = '';

      if (response.data.token) {
        token = response.data.token;
      } else if (response.data.result && response.data.result.token) {
        token = response.data.result.token;
      }

      if (response.data.refreshToken) {
        refreshToken = response.data.refreshToken;
      } else if (response.data.result && response.data.result.refreshToken) {
        refreshToken = response.data.result.refreshToken;
      }

      if (!token) {
        throw new Error('Authentication failed: No token received');
      }

      return { token, refreshToken };
    } catch (error: any) {
      // Handle 401 Unauthorized specifically
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }

      // Handle validation errors
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
        throw new Error(errorMessages);
      }

      // Handle error message in response data
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      // Handle other errors
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  },

  register: async (credentials: RegisterCredentials): Promise<void> => {
    try {
      const response = await axios.post<ApiResponse<void>>('/api/Account/register', credentials);

      if (response.data && response.data.isSuccess === false) {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      // Check for validation errors in the response
      if (error.response?.data) {
        const responseData = error.response.data;

        // Handle array of validation errors
        if (Array.isArray(responseData)) {
          const errorMessages = responseData
            .map((err) => err.description || err.message)
            .join(', ');
          throw new Error(errorMessages || 'Registration failed with validation errors');
        }

        // Handle object with validation errors
        if (responseData.message) {
          throw new Error(responseData.message);
        }
      }

      throw error;
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    try {
      const response = await axios.post<ApiResponse<void>>('/api/Account/forgot-password', {
        email,
      });

      // Check for explicit failure
      if (response.data && response.data.isSuccess === false) {
        throw new Error(response.data.message || 'Failed to process forgot password request');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    try {
      const response = await axios.post<ApiResponse<void>>('/api/Account/change-password', {
        email: data.email,
        currentPassword: data.currentPassword,
        confirmNewPassword: data.newPassword, // Use newPassword as confirmNewPassword
      });

      if (response.data && response.data.isSuccess === false) {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    try {
      const response = await axios.post<ApiResponse<void>>('/api/Account/reset-password', {
        email: data.email,
        token: data.token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword || data.newPassword,
      });

      if (response.data && response.data.isSuccess === false) {
        throw new Error(response.data.message || 'Failed to reset password');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  getCurrentUser: async (): Promise<UserDetails> => {
    try {
      // Use the detail endpoint (singular) for current logged-in user
      const response = await axios.get<UserDetails>('/api/Account/detail', {
        timeout: 15000, // 15 second timeout
      });

      // Based on the API documentation, the response is returned directly
      if (response.data && typeof response.data === 'object') {
        return response.data;
      }

      throw new Error('Invalid response format from API');
    } catch (error: any) {
      console.error('Error fetching current user details:', error);

      // Handle specific error cases
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Request timed out while fetching user details');
      }

      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        // Also clear any other auth-related storage
        localStorage.removeItem('user');
        localStorage.removeItem('rememberMe');
        throw new Error('Authentication expired. Please log in again.');
      }

      if (error.response?.status === 403) {
        throw new Error('Access denied. Please check your permissions.');
      }

      if (error.response?.status === 404) {
        throw new Error('User account not found.');
      }

      throw new Error('Failed to fetch user details');
    }
  },

  getAccountDetails: async (): Promise<UserDetails> => {
    try {
      // Use the detail endpoint for current user account details
      return await authService.getCurrentUser();
    } catch (error) {
      showErrorToast(error, 'fetching user profile');
      throw new Error('Could not retrieve account details. Please try again later.');
    }
  },

  refreshToken: async (): Promise<LoginResponse> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
        '/api/Account/refresh-token',
        {
          refreshToken,
        }
      );

      if (response.data && response.data.isSuccess === false) {
        throw new Error(response.data.message || 'Failed to refresh token');
      }

      // Extract token from various possible response formats
      let token = '';
      let newRefreshToken = refreshToken;

      if (response.data.token) {
        token = response.data.token;
      } else if (response.data.result && response.data.result.token) {
        token = response.data.result.token;
      }

      if (response.data.refreshToken) {
        newRefreshToken = response.data.refreshToken;
      } else if (response.data.result && response.data.result.refreshToken) {
        newRefreshToken = response.data.result.refreshToken;
      }

      if (!token) {
        throw new Error('Failed to refresh token: No token received');
      }

      return {
        token,
        refreshToken: newRefreshToken,
      };
    } catch (error: any) {
      // Force logout on refresh token failure
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  checkEmailAvailability: async (email: string): Promise<boolean> => {
    try {
      const response = await axios.post<ApiResponse<boolean>>('/api/Account/check-email', {
        email,
      });

      // If the API returns a specific format
      if (response.data && typeof response.data.isSuccess === 'boolean') {
        return response.data.isSuccess;
      }

      // If the API returns a result directly
      if (response.data && typeof response.data.result === 'boolean') {
        return response.data.result;
      }

      // Fallback: assume email is available if we get a 200 response
      return true;
    } catch (error: any) {
      // If we get a 409 Conflict, it means the email is already taken
      if (error.response?.status === 409) {
        return false;
      }

      // If the API returns a specific error for email exists
      if (error.response?.data?.message?.toLowerCase().includes('already exists')) {
        return false;
      }

      // For other errors, log and re-throw
      console.error('Error checking email availability:', error);
      throw new Error('Failed to check email availability');
    }
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      // If token can't be decoded, consider it expired
      return true;
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Try to call logout endpoint if it exists
      try {
        await axios.post('/api/Account/logout');
      } catch (error) {
        // Ignore errors from logout endpoint
        console.log('Logout endpoint not available or failed');
      }

      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear storage even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },
};

// Export functions for direct use
export const login = (credentials: LoginCredentials) => authService.login(credentials);
export const register = (credentials: RegisterCredentials) => authService.register(credentials);
export const forgotPassword = (email: string) => authService.forgotPassword(email);
export const changePassword = (data: ChangePasswordRequest) => authService.changePassword(data);
export const resetPassword = (data: ResetPasswordRequest) => authService.resetPassword(data);
export const getCurrentUser = () => authService.getCurrentUser();
export const refreshToken = () => authService.refreshToken();
export const logout = () => authService.logout();
