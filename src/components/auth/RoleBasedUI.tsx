import { useAuth } from '@/hooks/useAuth';
import { ReactNode } from 'react';

interface RoleBasedUIProps {
  children: ReactNode;
  requiredRoles: string[];
  requireAll?: boolean; // true = user must have ALL roles, false = user must have ANY role
  fallback?: ReactNode; // What to show if user doesn't have required roles
  showForUnauthenticated?: boolean; // Whether to show for unauthenticated users
}

/**
 * Component for conditional rendering based on user roles
 * Shows children only if user has the required roles
 */
function RoleBasedUI({
  children,
  requiredRoles,
  requireAll = false,
  fallback = null,
  showForUnauthenticated = false,
}: RoleBasedUIProps) {
  const { isAuthenticated, hasAnyRole, hasAllRoles } = useAuth();

  // If user is not authenticated
  if (!isAuthenticated) {
    return showForUnauthenticated ? <>{children}</> : <>{fallback}</>;
  }

  // Check role permissions
  const hasPermission = requireAll ? hasAllRoles(requiredRoles) : hasAnyRole(requiredRoles);

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

// Convenience components for common role checks
function AdminOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleBasedUI requiredRoles={['ADMIN']} fallback={fallback}>
      {children}
    </RoleBasedUI>
  );
}

function EmployeeOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleBasedUI requiredRoles={['EMPLOYEE']} fallback={fallback}>
      {children}
    </RoleBasedUI>
  );
}

function EmployeeOrAdmin({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleBasedUI requiredRoles={['EMPLOYEE', 'ADMIN']} requireAll={false} fallback={fallback}>
      {children}
    </RoleBasedUI>
  );
}

function AuthenticatedOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
}

function UnauthenticatedOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <>{fallback}</>;
}

// Higher-order component for role-based rendering
function withRoleCheck(
  Component: React.ComponentType<any>,
  requiredRoles: string[],
  requireAll = false,
  fallback?: ReactNode
) {
  return (props: any) => (
    <RoleBasedUI requiredRoles={requiredRoles} requireAll={requireAll} fallback={fallback}>
      <Component {...props} />
    </RoleBasedUI>
  );
}

// Hook for role-based logic in components
function useRoleBasedAccess() {
  const { isAuthenticated, hasRole, hasAnyRole, hasAllRoles, isAdmin, isEmployee, getUserRoles } =
    useAuth();

  return {
    isAuthenticated,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin: isAdmin(),
    isEmployee: isEmployee(),
    getUserRoles,
    canAccess: (roles: string[], requireAll = false) => {
      if (!isAuthenticated) return false;
      return requireAll ? hasAllRoles(roles) : hasAnyRole(roles);
    },
  };
}

// Export all components and hooks
export {
  AdminOnly, AuthenticatedOnly, EmployeeOnly,
  EmployeeOrAdmin, RoleBasedUI, UnauthenticatedOnly, useRoleBasedAccess, withRoleCheck
};

