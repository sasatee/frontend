import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  // We'll add role requirements later when implementing RBAC
  // requiredRoles?: string[];
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, checkingStatus } = useAuthStatus();
  const location = useLocation();

  if (checkingStatus) {
    // Show loading spinner while checking authentication status
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner className="h-12 w-12" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    // Store the current path to redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

// For future role-based access control, we'll implement this component
export const RoleProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // This is just a placeholder for now
  // We'll implement role checking later
  return <ProtectedRoute>{children}</ProtectedRoute>;
};
