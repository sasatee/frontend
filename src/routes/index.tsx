import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import DepartmentsPage from '@/pages/dashboard/DepartmentsPage';
import DepartmentDetailsPage from '@/pages/dashboard/DepartmentDetailsPage';
import RolesPage from '@/pages/dashboard/RolesPage';
import JobTitlesPage from '@/pages/dashboard/JobTitlesPage';
import UserDetailsPage from '@/pages/dashboard/UserDetailsPage';
import ChangePasswordPage from '@/pages/dashboard/ChangePasswordPage';
import CategoryGroupsPage from '@/pages/dashboard/CategoryGroupsPage';
import EmployeesPage from '@/pages/dashboard/EmployeesPage';
import AttendancePage from '@/pages/dashboard/AttendancePage';
import AttendanceDetailsPage from '@/pages/dashboard/AttendanceDetailsPage';
import EditAttendancePage from '@/pages/dashboard/EditAttendancePage';
import NewAttendancePage from '@/pages/dashboard/NewAttendancePage';
import AllowancesPage from '@/pages/dashboard/AllowancesPage';
import DeductionsPage from '@/pages/dashboard/DeductionsPage';
import LeaveTypesPage from '@/pages/dashboard/LeaveTypesPage';
import LeaveRequestsPage from '@/pages/dashboard/LeaveRequestsPage';
import MyLeaveRequestsPage from '@/pages/dashboard/MyLeaveRequestsPage';
import LeaveBalancePage from '@/pages/dashboard/LeaveBalancePage';
import EnhancedTableExample from '@/pages/dashboard/EnhancedTableExample';
import LeaveAllocationsPage from '@/pages/dashboard/LeaveAllocationsPage';
import { PayrollPage } from '@/pages/dashboard/PayrollPage';

// Employee Personal Pages
import MyPayrollPage from '@/pages/dashboard/MyPayrollPage';
import MyAllowancesPage from '@/pages/dashboard/MyAllowancesPage';
import MyDeductionsPage from '@/pages/dashboard/MyDeductionsPage';
import MyAttendancePage from '@/pages/dashboard/MyAttendancePage';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  RoleProtectedRoute,
  AdminRoute,
  EmployeeRoute,
  RequireAnyRole,
} from '@/components/auth/RoleProtectedRoute';
import { AccessibleLoginForm } from '@/components/auth/AccessibleLoginForm';
import { AccessibleEmployeeForm } from '@/components/employees/AccessibleEmployeeForm';
import { AccessibilityGuide } from '@/components/AccessibilityGuide';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/accessible-login',
    element: <AccessibleLoginForm />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'dashboard',
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          // Admin Only Routes
          {
            path: 'employees',
            element: (
              <AdminRoute>
                <EmployeesPage />
              </AdminRoute>
            ),
          },
          {
            path: 'enhanced-table',
            element: <EnhancedTableExample />,
          },
          {
            path: 'departments',
            element: (
              <AdminRoute>
                <DepartmentsPage />
              </AdminRoute>
            ),
          },
          {
            path: 'departments/:id',
            element: (
              <AdminRoute>
                <DepartmentDetailsPage />
              </AdminRoute>
            ),
          },
          {
            path: 'job-titles',
            element: (
              <AdminRoute>
                <JobTitlesPage />
              </AdminRoute>
            ),
          },
          {
            path: 'category-groups',
            element: (
              <AdminRoute>
                <CategoryGroupsPage />
              </AdminRoute>
            ),
          },
          {
            path: 'roles',
            element: (
              <AdminRoute>
                <RolesPage />
              </AdminRoute>
            ),
          },
          // Admin Attendance Management
          {
            path: 'attendance',
            element: (
              <AdminRoute>
                <AttendancePage />
              </AdminRoute>
            ),
          },
          {
            path: 'attendance/new',
            element: (
              <AdminRoute>
                <NewAttendancePage />
              </AdminRoute>
            ),
          },
          {
            path: 'attendance/:id/edit',
            element: (
              <AdminRoute>
                <EditAttendancePage />
              </AdminRoute>
            ),
          },
          {
            path: 'attendance/:id',
            element: (
              <AdminRoute>
                <AttendanceDetailsPage />
              </AdminRoute>
            ),
          },
          // Admin Leave Management
          {
            path: 'leave-types',
            element: (
              <AdminRoute>
                <LeaveTypesPage />
              </AdminRoute>
            ),
          },
          {
            path: 'leave-allocations',
            element: (
              <AdminRoute>
                <LeaveAllocationsPage />
              </AdminRoute>
            ),
          },
          {
            path: 'leave-requests',
            element: (
              <AdminRoute>
                <LeaveRequestsPage />
              </AdminRoute>
            ),
          },
          // Admin Financial Management
          {
            path: 'allowances',
            element: (
              <AdminRoute>
                <AllowancesPage />
              </AdminRoute>
            ),
          },
          {
            path: 'deductions',
            element: (
              <AdminRoute>
                <DeductionsPage />
              </AdminRoute>
            ),
          },
          {
            path: 'payroll',
            element: (
              <AdminRoute>
                <PayrollPage />
              </AdminRoute>
            ),
          },
          // Employee Personal Routes
          {
            path: 'my-leave-requests',
            element: (
              <EmployeeRoute>
                <MyLeaveRequestsPage />
              </EmployeeRoute>
            ),
          },
          {
            path: 'leave-balance',
            element: (
              <EmployeeRoute>
                <LeaveBalancePage />
              </EmployeeRoute>
            ),
          },
          {
            path: 'my-attendance',
            element: (
              <EmployeeRoute>
                <MyAttendancePage />
              </EmployeeRoute>
            ),
          },
          {
            path: 'my-payroll',
            element: (
              <EmployeeRoute>
                <MyPayrollPage />
              </EmployeeRoute>
            ),
          },
          {
            path: 'my-allowances',
            element: (
              <EmployeeRoute>
                <MyAllowancesPage />
              </EmployeeRoute>
            ),
          },
          {
            path: 'my-deductions',
            element: (
              <EmployeeRoute>
                <MyDeductionsPage />
              </EmployeeRoute>
            ),
          },
          // Shared Routes (All Authenticated Users)
          {
            path: 'profile',
            element: (
              <RequireAnyRole roles={['EMPLOYEE', 'ADMIN']}>
                <UserDetailsPage />
              </RequireAnyRole>
            ),
          },
          {
            path: 'change-password',
            element: (
              <RequireAnyRole roles={['EMPLOYEE', 'ADMIN']}>
                <ChangePasswordPage />
              </RequireAnyRole>
            ),
          },
          // Accessibility Routes
          {
            path: 'accessibility-guide',
            element: <AccessibilityGuide />,
          },
          {
            path: 'accessible-employee-form',
            element: <AccessibleEmployeeForm />,
          },
        ],
      },
    ],
  },
]);

export default router;
