import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { authService } from '../services/authService';
import { useToast } from '@/components/ui/use-toast';
import { jwtDecode } from 'jwt-decode';
import {
  decodeJwtToken,
  getUserRolesFromToken,
  hasRequiredRoles,
  isAdmin,
  isEmployee,
} from '@/lib/jwt-utils';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  phoneNumber: string;
  twoFactorEnabled: boolean;
  phoneNumberConfirmed: boolean;
  accessFailedCount: number;
  appUserId: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  extendSession: () => Promise<void>;
  remainingSessionTime: number;
  // Role-based methods
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  isEmployee: () => boolean;
  getUserRoles: () => string[];
  getCurrentUserId: () => string | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsInitialized] = useState(false);
  const timeoutRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const retryCount = useRef(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;
  const { toast } = useToast();

  // Memoize timeout clear function
  const clearTimeouts = useCallback(() => {
    Object.values(timeoutRefs.current).forEach(clearTimeout);
    timeoutRefs.current = {};
  }, []);

  // Memoize token refresh setup
  const setupTokenRefresh = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decodedToken = jwtDecode(token);
      const expiryTime = decodedToken.exp ? decodedToken.exp * 1000 : 0;
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;

      // Clear any existing refresh timeout
      if (timeoutRefs.current.tokenRefresh) {
        clearTimeout(timeoutRefs.current.tokenRefresh);
      }

      // Set up new refresh timeout
      if (timeUntilExpiry > 0) {
        // Refresh 5 minutes before expiry
        const refreshDelay = Math.max(0, timeUntilExpiry - 5 * 60 * 1000);
        timeoutRefs.current.tokenRefresh = setTimeout(async () => {
          try {
            const newTokens = await authService.refreshToken();
            localStorage.setItem('token', newTokens.token);
            localStorage.setItem('refreshToken', newTokens.refreshToken);

            // Reset retry count on successful refresh
            retryCount.current = 0;

            // Set up next refresh
            setupTokenRefresh();
          } catch (error) {
            console.error('Token refresh failed:', error);

            // Implement exponential backoff for retries
            if (retryCount.current < MAX_RETRIES) {
              retryCount.current++;
              const retryDelay = RETRY_DELAY * Math.pow(2, retryCount.current - 1);
              setTimeout(setupTokenRefresh, retryDelay);
            } else {
              // Max retries reached, log out user
              handleLogout();
            }
          }
        }, refreshDelay);
      } else {
        // Token is already expired
        handleLogout();
      }
    } catch (error) {
      console.error('Error setting up token refresh:', error);
      handleLogout();
    }
  }, []);

  // Memoize session timeout setup
  const setupSessionTimeout = useCallback(() => {
    const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours

    if (timeoutRefs.current.session) {
      clearTimeout(timeoutRefs.current.session);
    }

    timeoutRefs.current.session = setTimeout(() => {
      handleLogout();
    }, SESSION_TIMEOUT);
  }, []);

  // Memoize inactivity check setup
  const setupInactivityCheck = useCallback(() => {
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      inactivityTimer = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_TIMEOUT);
    };

    // Set up event listeners for user activity
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    // Initial setup
    resetInactivityTimer();

    // Cleanup function
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, []);

  // Memoize auth check function
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }

      let errorCount = 0;
      while (errorCount < MAX_RETRIES) {
        try {
          const userDetails = await authService.getCurrentUser();
          setUser(userDetails);

          // Set up automatic token refresh and session management
          setupTokenRefresh();
          setupSessionTimeout();
          setupInactivityCheck();
          break;
        } catch (error) {
          errorCount++;
          console.error(
            `Error fetching user details (attempt ${errorCount}/${MAX_RETRIES}):`,
            error
          );

          if (errorCount >= MAX_RETRIES) {
            console.error('Max retries reached, clearing auth state');
            handleLogout();
          } else {
            await new Promise((resolve) =>
              setTimeout(resolve, RETRY_DELAY * Math.pow(2, errorCount - 1))
            );
          }
        }
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
      handleLogout();
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [setupTokenRefresh, setupSessionTimeout, setupInactivityCheck]);

  // Initialize auth state
  useEffect(() => {
    checkAuth();
    return () => {
      clearTimeouts();
    };
  }, [checkAuth, clearTimeouts]);

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      setIsLoading(true);
      // Pass credentials as expected by authService.login
      const { token, refreshToken } = await authService.login({ email, password });

      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      // If remember me is checked, store a flag
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      // Fetch user details separately
      try {
        const userDetails = await authService.getCurrentUser();
        setUser(userDetails);
      } catch (userError) {
        console.error('Error fetching user details after login:', userError);
        // Continue with login even if user details fetch fails
        // The token refresh mechanism will try again later
      }

      // Set up automatic token refresh and session timeout
      setupTokenRefresh();
      setupSessionTimeout();
      setupInactivityCheck();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = (expired = false, message?: string) => {
    // Clear authentication state
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');

    // Clear all timeouts and intervals
    clearTimeouts();

    // Show message if session expired
    if (expired && message) {
      toast({
        title: 'Session Ended',
        description: message,
        duration: 5000,
        variant: 'destructive',
      });
    }
  };

  // Role-based helper methods
  const hasRole = (role: string): boolean => {
    if (!user || !user.roles) return false;
    return hasRequiredRoles(user.roles, [role]);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user || !user.roles) return false;
    return hasRequiredRoles(user.roles, roles, false);
  };

  const hasAllRoles = (roles: string[]): boolean => {
    if (!user || !user.roles) return false;
    return hasRequiredRoles(user.roles, roles, true);
  };

  const isAdminUser = (): boolean => {
    if (!user || !user.roles) return false;
    return isAdmin(user.roles);
  };

  const isEmployeeUser = (): boolean => {
    if (!user || !user.roles) return false;
    return isEmployee(user.roles);
  };

  const getUserRoles = (): string[] => {
    return user?.roles || [];
  };

  const getCurrentUserId = (): string | null => {
    return user?.id || null;
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      handleLogout();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local auth state even if API call fails
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        isAuthenticated: !!user,
        extendSession: async () => {
          try {
            await authService.refreshToken();
            toast({
              title: 'Session Extended',
              description: 'Your session has been extended successfully.',
              duration: 3000,
            });
          } catch (error) {
            toast({
              title: 'Session Extension Failed',
              description: 'Unable to extend your session. Please log in again.',
              duration: 5000,
              variant: 'destructive',
            });
            handleLogout(true, 'Unable to extend your session. Please log in again.');
          }
        },
        remainingSessionTime: 0,
        // Role-based methods
        hasRole,
        hasAnyRole,
        hasAllRoles,
        isAdmin: isAdminUser,
        isEmployee: isEmployeeUser,
        getUserRoles,
        getCurrentUserId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
