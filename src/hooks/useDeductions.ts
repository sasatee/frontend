// @ts-ignore
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Deduction, CreateDeductionDto, UpdateDeductionDto } from '@/types/deduction';
import { Employee } from '@/types/employee';
import {
  getDeductions,
  createDeduction,
  updateDeduction,
  deleteDeduction,
} from '@/services/deductionService';
import { employeeService } from '@/services/employeeService';

interface DeductionWithEmployee extends Deduction {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    dateOfJoining: string;
    dateOfLeaving: string;
    departmentId: string;
    jobTitleId: string;
    appUserId: string;
    nic: string;
    yearsOfService: number;
    currentSalary: number;
    categoryGroupId: string;
  } | null;
}

export const useDeductions = () => {
  const queryClient = useQueryClient();

  // Fetch deductions with employee names
  const {
    data: deductions = [],
    isLoading,
    error,
    refetch,
  } = useQuery<DeductionWithEmployee[]>({
    queryKey: ['deductions'],
    queryFn: async (): Promise<DeductionWithEmployee[]> => {
      try {
        // Fetch deductions
        const deductionsData = await getDeductions();

        // Get all employees to map employee names
        const employees = await employeeService.getAllEmployees();

        // Create a map of employee ID to employee data for quick lookup
        const employeeMap = new Map<string, Employee>();
        employees.forEach((employee) => {
          employeeMap.set(employee.id, employee);
        });

        // Enrich deductions with employee data
        const enrichedDeductions: DeductionWithEmployee[] = deductionsData.map((deduction) => {
          const employee = employeeMap.get(deduction.employeeId);

          return {
            ...deduction,
            employee: employee
              ? {
                  id: employee.id,
                  firstName: employee.firstName,
                  lastName: employee.lastName,
                  email: employee.email,
                  phone: employee.phone,
                  address: employee.address,
                  dateOfJoining: employee.dateOfJoining,
                  dateOfLeaving: employee.dateOfLeaving,
                  departmentId: employee.departmentId,
                  jobTitleId: employee.jobTitleId,
                  appUserId: employee.appUserId,
                  nic: employee.nic,
                  yearsOfService: employee.yearsOfService,
                  currentSalary: employee.salary || 0,
                  categoryGroupId: employee.categoryGroupId || '',
                }
              : null,
          };
        });

        return enrichedDeductions;
      } catch (error) {
        console.error('Error fetching deductions with employee names:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Create deduction mutation
  const createMutation = useMutation({
    mutationFn: createDeduction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deductions'] });
      toast.success('Deduction created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create deduction');
    },
  });

  // Update deduction mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeductionDto }) =>
      updateDeduction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deductions'] });
      toast.success('Deduction updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update deduction');
    },
  });

  // Delete deduction mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDeduction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deductions'] });
      toast.success('Deduction deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete deduction');
    },
  });

  return {
    deductions,
    isLoading,
    error,
    refetch,
    createDeduction: createMutation.mutate,
    updateDeduction: updateMutation.mutate,
    deleteDeduction: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
