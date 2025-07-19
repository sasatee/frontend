import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { useCurrentEmployeeId } from './useCurrentEmployeeId';

interface EmployeePayrollRecord {
    id: string;
    payDate: string;
    basicSalary: number;
    allowances: number;
    deductions: number;
    netPay: number;
    employeeId: string;
    employee?: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

interface UseEmployeePayrollOptions {
    enabled?: boolean;
}

export function useEmployeePayroll(options: UseEmployeePayrollOptions = {}) {
    const { enabled = true } = options;
    const { data: currentEmployeeId, isLoading: isLoadingEmployeeId } = useCurrentEmployeeId();

    const {
        data: payrollRecords = [],
        isLoading: isLoadingPayroll,
        error,
        refetch,
    } = useQuery<EmployeePayrollRecord[]>({
        queryKey: ['employee-payroll', currentEmployeeId],
        queryFn: async () => {
            if (!currentEmployeeId) {
                throw new Error('Employee ID not found');
            }

            console.log('🔄 Fetching all payroll records to filter by employee:', { currentEmployeeId });

            // Get all payroll records and filter by employee ID since there's no specific endpoint
            const url = `/api/Payroll`;

            const response = await axios.get(url);
            console.log('✅ All payroll response:', response.data);
            console.log('Response type:', typeof response.data);
            console.log('Is array:', Array.isArray(response.data));
            console.log('Response keys:', response.data ? Object.keys(response.data) : 'null/undefined');

            // Handle different response structures
            let allPayrollData = response.data;

            // If response has a data property, use that
            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                allPayrollData = response.data.data;
            }
            // If response is not an array, return empty array
            else if (!Array.isArray(response.data)) {
                console.warn('Payroll response is not an array:', response.data);
                allPayrollData = [];
            }

            // Filter by current employee ID
            const employeePayrolls = allPayrollData.filter((payroll: any) =>
                payroll.employeeId === currentEmployeeId
            );

            console.log('Filtered payrolls for employee:', employeePayrolls);
            return employeePayrolls;
        },
        enabled: enabled && !!currentEmployeeId && typeof currentEmployeeId === 'string',
        retry: 2,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    });

    // Calculate totals from the payroll records since there are no specific endpoints
    const totalAllowances = payrollRecords.reduce((sum, record) => sum + (record.allowances || 0), 0);
    const totalDeductions = payrollRecords.reduce((sum, record) => sum + (record.deductions || 0), 0);

    return {
        payrollRecords,
        totalAllowances,
        totalDeductions,
        isLoading: isLoadingEmployeeId || isLoadingPayroll,
        error,
        refetch,
        currentEmployeeId,
    };
} 