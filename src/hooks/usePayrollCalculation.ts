import { useToast } from '@/components/ui/use-toast';
import { payrollService } from '@/services/payrollService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function usePayrollCalculation() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const calculatePayrollMutation = useMutation({
        mutationFn: payrollService.calculatePayroll,
        onSuccess: (data) => {
            // Invalidate and refetch payroll data
            queryClient.invalidateQueries({ queryKey: ['payrolls'] });
            queryClient.invalidateQueries({ queryKey: ['payrolls-with-employees'] });

            toast({
                title: '✅ Payroll Calculated Successfully',
                description: `Payroll has been calculated for the employee. Net Pay: Rs ${data.netPay?.toLocaleString() || 'N/A'}`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: '❌ Payroll Calculation Failed',
                description: error.message || 'Failed to calculate payroll',
                variant: 'destructive',
            });
        },
    });

    return {
        calculatePayroll: calculatePayrollMutation.mutateAsync,
        isCalculating: calculatePayrollMutation.isPending,
        error: calculatePayrollMutation.error,
    };
} 