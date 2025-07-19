import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { payrollService } from '@/services/payrollService';
import { useToast } from '@/components/ui/use-toast';

export function usePayroll() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: payrolls, isLoading: isLoadingPayrolls } = useQuery({
    queryKey: ['payrolls'],
    queryFn: payrollService.getAllPayrolls,
  });

  const createPayrollMutation = useMutation({
    mutationFn: payrollService.createPayroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      toast({
        title: 'Success',
        description: 'Payroll created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create payroll',
        variant: 'destructive',
      });
    },
  });

  const deletePayrollMutation = useMutation({
    mutationFn: payrollService.deletePayroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      toast({
        title: 'Success',
        description: 'Payroll deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete payroll',
        variant: 'destructive',
      });
    },
  });

  return {
    payrolls,
    isLoadingPayrolls,
    createPayroll: createPayrollMutation.mutateAsync,
    deletePayroll: deletePayrollMutation.mutateAsync,
    isCreating: createPayrollMutation.isPending,
    isDeleting: deletePayrollMutation.isPending,
  };
}
