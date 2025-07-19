import { getAllEmployees } from '@/services/employeeService';
import { Employee } from '@/types/employee';
import { getUserIdFromToken } from './jwt-utils';

/**
 * Check if the current user can access data for a specific employee
 * @param employeeId The employee ID to check access for
 * @param userRoles Current user's roles
 * @param currentUserId Current user's ID
 * @returns Boolean indicating if access is allowed
 */
export const canAccessEmployeeData = (
  employeeId: string,
  userRoles: string[],
  currentUserId: string | null
): boolean => {
  // Admin can access all employee data
  if (userRoles.includes('ADMIN')) {
    return true;
  }

  // Employee can only access their own data
  if (userRoles.includes('EMPLOYEE')) {
    return currentUserId === employeeId;
  }

  // No access by default
  return false;
};

/**
 * Filter employee data based on user roles
 * @param data Array of employee data
 * @param userRoles Current user's roles
 * @param currentUserId Current user's ID
 * @returns Filtered array of employee data
 */
export const filterEmployeeData = <T extends { employeeId?: string; id?: string }>(
  data: T[],
  userRoles: string[],
  currentUserId: string | null
): T[] => {
  // Admin can see all data
  if (userRoles.includes('ADMIN')) {
    return data;
  }

  // Employee can only see their own data
  if (userRoles.includes('EMPLOYEE') && currentUserId) {
    return data.filter((item) => {
      const itemEmployeeId = item.employeeId || item.id;
      return itemEmployeeId === currentUserId;
    });
  }

  // No access by default
  return [];
};

/**
 * Check if user can perform CRUD operations on employee data
 * @param operation The operation to check ('create', 'read', 'update', 'delete')
 * @param userRoles Current user's roles
 * @param targetEmployeeId The employee ID being operated on (for update/delete)
 * @param currentUserId Current user's ID
 * @returns Boolean indicating if operation is allowed
 */
export const canPerformEmployeeOperation = (
  operation: 'create' | 'read' | 'update' | 'delete',
  userRoles: string[],
  targetEmployeeId?: string,
  currentUserId?: string | null
): boolean => {
  // Admin can perform all operations
  if (userRoles.includes('ADMIN')) {
    return true;
  }

  // Employee permissions
  if (userRoles.includes('EMPLOYEE')) {
    switch (operation) {
      case 'create':
        return false; // Employees cannot create other employees
      case 'read':
        // Employees can read their own data
        return targetEmployeeId ? currentUserId === targetEmployeeId : true;
      case 'update':
        // Employees can update their own data (limited fields)
        return targetEmployeeId ? currentUserId === targetEmployeeId : false;
      case 'delete':
        return false; // Employees cannot delete employee records
      default:
        return false;
    }
  }

  return false;
};

/**
 * Get current user ID from token
 * @returns Current user ID or null
 */
export const getCurrentUserId = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  return getUserIdFromToken(token);
};

/**
 * Get current user employee ID from token (alias for getCurrentUserId)
 * @returns Current user employee ID or null
 */
export const getCurrentUserEmployeeId = (): string | null => {
  return getCurrentUserId();
};

/**
 * Get current user employee ID by matching appUserId from JWT token with employee data
 * @returns Promise that resolves to employee ID or null
 */
export const getCurrentUserEmployeeIdFromEmployees = async (): Promise<string | null> => {
  try {
    const appUserId = getCurrentUserId();
    if (!appUserId) {
      console.warn('No appUserId found in JWT token');
      return null;
    }

    const employees = await getAllEmployees();
    const employee = employees.find((emp: Employee) => emp.appUserId === appUserId);

    if (employee) {
      console.log('Found employee ID:', employee.id, 'for appUserId:', appUserId);
      return employee.id;
    } else {
      console.warn('No employee found for appUserId:', appUserId);
      return null;
    }
  } catch (error) {
    console.error('Error fetching employee ID:', error);
    return null;
  }
};

/**
 * Check if user can access allowance data
 * @param allowanceEmployeeId The employee ID associated with the allowance
 * @param userRoles Current user's roles
 * @param currentUserId Current user's ID
 * @returns Boolean indicating if access is allowed
 */
export const canAccessAllowanceData = (
  allowanceEmployeeId: string,
  userRoles: string[],
  currentUserId: string | null
): boolean => {
  return canAccessEmployeeData(allowanceEmployeeId, userRoles, currentUserId);
};

/**
 * Check if user can access deduction data
 * @param deductionEmployeeId The employee ID associated with the deduction
 * @param userRoles Current user's roles
 * @param currentUserId Current user's ID
 * @returns Boolean indicating if access is allowed
 */
export const canAccessDeductionData = (
  deductionEmployeeId: string,
  userRoles: string[],
  currentUserId: string | null
): boolean => {
  return canAccessEmployeeData(deductionEmployeeId, userRoles, currentUserId);
};

/**
 * Check if user can access leave request data
 * @param leaveRequestEmployeeId The employee ID associated with the leave request
 * @param userRoles Current user's roles
 * @param currentUserId Current user's ID
 * @returns Boolean indicating if access is allowed
 */
export const canAccessLeaveRequestData = (
  leaveRequestEmployeeId: string,
  userRoles: string[],
  currentUserId: string | null
): boolean => {
  return canAccessEmployeeData(leaveRequestEmployeeId, userRoles, currentUserId);
};

/**
 * Check if user can access attendance data
 * @param attendanceEmployeeId The employee ID associated with the attendance
 * @param userRoles Current user's roles
 * @param currentUserId Current user's ID
 * @returns Boolean indicating if access is allowed
 */
export const canAccessAttendanceData = (
  attendanceEmployeeId: string,
  userRoles: string[],
  currentUserId: string | null
): boolean => {
  return canAccessEmployeeData(attendanceEmployeeId, userRoles, currentUserId);
};

/**
 * Check if user can access payroll data
 * @param payrollEmployeeId The employee ID associated with the payroll
 * @param userRoles Current user's roles
 * @param currentUserId Current user's ID
 * @returns Boolean indicating if access is allowed
 */
export const canAccessPayrollData = (
  payrollEmployeeId: string,
  userRoles: string[],
  currentUserId: string | null
): boolean => {
  return canAccessEmployeeData(payrollEmployeeId, userRoles, currentUserId);
};
