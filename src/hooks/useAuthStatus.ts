import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useAuthStatus = () => {
  const { user, isLoading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    // If auth context is no longer loading, we can determine auth status
    if (!isLoading) {
      setIsAuthenticated(!!user);
      setCheckingStatus(false);
    }
  }, [user, isLoading]);

  return { isAuthenticated, checkingStatus };
};
