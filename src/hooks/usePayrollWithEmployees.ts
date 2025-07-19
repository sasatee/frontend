import { useQuery } from '@tanstack/react-query';
import { payrollService, PayrollResponse } from '@/services/payrollService';
import { employeeService } from '@/services/employeeService';

interface EnrichedPayrollResponse extends PayrollResponse {
  employeeName: string;
}

export function usePayrollWithEmployees() {
  return useQuery({
    queryKey: ['payrolls-with-employees'],
    queryFn: async (): Promise<EnrichedPayrollResponse[]> => {
      // Fetch both payrolls and employees in parallel
      const [payrolls, employees] = await Promise.all([
        payrollService.getAllPayrolls(),
        employeeService.getAllEmployees(),
      ]);

      console.log('Fetched payrolls:', payrolls);
      console.log('Fetched employees:', employees);
      console.log('Employee structure sample:', employees[0]);

      // Enrich payroll data with employee names
      const enrichedPayrolls = payrolls.map((payroll) => {
        console.log(`Looking for employee with ID: ${payroll.employeeId}`);
        const employee = employees.find((emp) => {
          console.log(`Comparing ${emp.id} with ${payroll.employeeId}`);
          return emp.id === payroll.employeeId;
        });

        console.log(`Found employee:`, employee);

        const employeeName = employee
          ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim()
          : payroll.employeeId;

        console.log(`Final employee name for ${payroll.employeeId}: "${employeeName}"`);

        return {
          ...payroll,
          employeeName,
        };
      });

      console.log('Final enriched payrolls:', enrichedPayrolls);
      return enrichedPayrolls;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
