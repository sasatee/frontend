import React, { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useLoading } from '@/contexts/LoadingContext';
import { Button } from '@/components/ui/button';
import { Employee } from '@/types/employee';
import { Department } from '@/types/department';
import { JobTitle } from '@/types/jobTitle';
import { CategoryGroup } from '@/types/categoryGroup';
import { useEmployees } from '@/hooks/useEmployees';
import { useDepartments } from '@/hooks/useDepartments';
import { useJobTitles } from '@/hooks/useJobTitles';
import { useCategoryGroups } from '@/hooks/useCategoryGroups';
import { DataTable } from '@/components/common/DataTable';
import { getEmployeeColumns } from '@/components/employees/columns';
import EmployeeDialog from '@/components/employees/EmployeeDialog';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { showErrorToast } from '@/lib/error-handler';
import { employeeService } from '@/services/employeeService';

export default function EmployeesPage() {
  // State management
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>();
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  // Hooks
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { withLoading } = useLoading();

  // Fetch data with optimized queries
  const {
    data: employees = [],
    isLoading: isLoadingEmployees,
    refetch: refetchEmployees,
    error: employeesError,
  } = useEmployees();

  const { data: departments = [], isLoading: isLoadingDepartments } = useDepartments();

  const { data: jobTitles = [], isLoading: isLoadingJobTitles } = useJobTitles();

  const { data: categoryGroups = [], isLoading: isLoadingCategoryGroups } = useCategoryGroups();

  // Handlers
  const handleCreate = useCallback(() => {
    setSelectedEmployee(undefined);
    setOpenEmployeeDialog(true);
  }, []);

  const handleEdit = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenEmployeeDialog(true);
  }, []);

  const handleDelete = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenDeleteDialog(true);
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      await withLoading(
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ['employees'] }),
          queryClient.invalidateQueries({ queryKey: ['departments'] }),
          queryClient.invalidateQueries({ queryKey: ['jobTitles'] }),
          queryClient.invalidateQueries({ queryKey: ['categoryGroups'] }),
        ]),
        'Refreshing data...'
      );

      toast({
        title: 'Success',
        description: 'Employee data has been refreshed',
      });
    } catch (error) {
      showErrorToast(error, 'refreshing employees');
    }
  }, [queryClient, toast, withLoading]);

  // Memoize enriched employees data
  const enrichedEmployees = useMemo(() => {
    try {
      if (!employees || !Array.isArray(employees)) {
        return [];
      }

      return employees.map((employee) => {
        try {
          return {
            ...employee,
            department: departments?.find((d) => d.id === employee.departmentId) || null,
            jobTitle: jobTitles?.find((j) => j.id === employee.jobTitleId) || null,
            categoryGroup: categoryGroups?.find((c) => c.id === employee.categoryGroupId) || null,
          };
        } catch (error) {
          console.error('Error enriching employee:', error);
          return {
            ...employee,
            department: null,
            jobTitle: null,
            categoryGroup: null,
          };
        }
      });
    } catch (error) {
      console.error('Error processing employees:', error);
      return [];
    }
  }, [employees, departments, jobTitles, categoryGroups]);

  // Memoize table columns
  const columns = useMemo(() => {
    try {
      return getEmployeeColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      });
    } catch (error) {
      console.error('Error creating columns:', error);
      return [];
    }
  }, [handleEdit, handleDelete]);

  const isLoading =
    isLoadingEmployees || isLoadingDepartments || isLoadingJobTitles || isLoadingCategoryGroups;

  // Error handling
  if (employeesError) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load employees. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (!isLoading && enrichedEmployees.length === 0) {
    return (
      <Alert className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Employees Found</AlertTitle>
        <AlertDescription>
          There are no employees in the system. Click the "Add Employee" button to create one.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {columns.length > 0 ? (
        <DataTable
          columns={columns}
          data={enrichedEmployees || []}
          isLoading={isLoading}
          pagination
          initialPageSize={pageSize}
          searchPlaceholder="Search employees..."
          title="Employee Directory"
          subtitle="View and manage all employees"
          actions={<Button onClick={handleCreate}>Add Employee</Button>}
        />
      ) : (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Unable to load employee table configuration. Please refresh the page.
          </AlertDescription>
        </Alert>
      )}

      <EmployeeDialog
        open={openEmployeeDialog}
        onOpenChange={setOpenEmployeeDialog}
        employee={selectedEmployee}
      />

      <ConfirmationDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        title="Delete Employee"
        description={`Are you sure you want to delete ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}? This action cannot be undone.`}
        onConfirm={async () => {
          if (!selectedEmployee) return;
          try {
            await withLoading(
              employeeService.deleteEmployee(selectedEmployee.id),
              'Deleting employee...'
            );
            setOpenDeleteDialog(false);
            await refetchEmployees();
            toast({
              title: 'Success',
              description: 'Employee deleted successfully',
            });
          } catch (error) {
            showErrorToast(error, 'deleting employee');
          }
        }}
      />
    </div>
  );
}
