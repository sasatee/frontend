import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: ReactNode;
  requiredRoles: string[];
  requireAll?: boolean; // true = user must have ALL roles, false = user must have ANY role
  fallback?: ReactNode; // Custom fallback component
  redirectTo?: string; // Custom redirect path
}

export const RoleProtectedRoute = ({
  children,
  requiredRoles,
  requireAll = false,
  fallback,
  redirectTo,
}: RoleProtectedRouteProps) => {
  const { isAuthenticated, checkingStatus } = useAuthStatus();
  const { hasAnyRole, hasAllRoles, getUserRoles } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication status
  if (checkingStatus) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner className="h-12 w-12" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check role permissions
  const hasPermission = requireAll ? hasAllRoles(requiredRoles) : hasAnyRole(requiredRoles);

  // If user doesn't have required roles
  if (!hasPermission) {
    // Use custom fallback if provided
    if (fallback) {
      return <>{fallback}</>;
    }

    // Use custom redirect if provided
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // Default insufficient permissions UI
    return (
      <div className="flex h-screen w-full items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription className="mt-2">
              You don't have the required permissions to access this page.
              <br />
              <br />
              <strong>Required roles:</strong> {requiredRoles.join(requireAll ? ' AND ' : ' OR ')}
              <br />
              <strong>Your roles:</strong> {getUserRoles().join(', ') || 'None'}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button
              onClick={() => (window.location.href = '/dashboard')}
              className="flex items-center gap-2"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // User has required permissions, render the protected content
  return <>{children}</>;
};

// Convenience component for admin-only routes
export const AdminRoute = ({ children }: { children: ReactNode }) => (
  <RoleProtectedRoute requiredRoles={['ADMIN']}>{children}</RoleProtectedRoute>
);

// Convenience component for employee routes (including admin)
export const EmployeeRoute = ({ children }: { children: ReactNode }) => (
  <RoleProtectedRoute requiredRoles={['EMPLOYEE', 'ADMIN']} requireAll={false}>
    {children}
  </RoleProtectedRoute>
);

// Convenience component for routes that require specific roles
export const RequireRole = ({ role, children }: { role: string; children: ReactNode }) => (
  <RoleProtectedRoute requiredRoles={[role]}>{children}</RoleProtectedRoute>
);

// Convenience component for routes that require multiple roles
export const RequireAllRoles = ({ roles, children }: { roles: string[]; children: ReactNode }) => (
  <RoleProtectedRoute requiredRoles={roles} requireAll={true}>
    {children}
  </RoleProtectedRoute>
);

// Convenience component for routes that require any of multiple roles
export const RequireAnyRole = ({ roles, children }: { roles: string[]; children: ReactNode }) => (
  <RoleProtectedRoute requiredRoles={roles} requireAll={false}>
    {children}
  </RoleProtectedRoute>
);
