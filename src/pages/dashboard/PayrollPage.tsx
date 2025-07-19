import { useState } from 'react';
import { usePayroll } from '@/hooks/usePayroll';
import { usePayrollWithEmployees } from '@/hooks/usePayrollWithEmployees';
import { getPayrollColumns } from '@/components/payroll/columns';
import { PayrollDialog } from '@/components/payroll/PayrollDialog';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { ConfirmActionDialog } from '@/components/ConfirmActionDialog';

export function PayrollPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deletePayrollId, setDeletePayrollId] = useState<string | null>(null);
  const { toast } = useToast();
  const { createPayroll, deletePayroll, isDeleting } = usePayroll();
  const { data: enrichedPayrolls, isLoading: isLoadingEnriched } = usePayrollWithEmployees();

  const handleDelete = async () => {
    if (!deletePayrollId) return;

    try {
      await deletePayroll(deletePayrollId);
      setDeletePayrollId(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete payroll',
        variant: 'destructive',
      });
    }
  };

  const columns = getPayrollColumns({
    onDelete: (id) => setDeletePayrollId(id),
  });

  if (isLoadingEnriched) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Payroll
        </Button>
      </div>

      <div className="mt-8">
        <DataTable
          columns={columns}
          data={enrichedPayrolls || []}
          searchPlaceholder="Search payrolls..."
        />
      </div>

      <PayrollDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={async (data) => {
          try {
            await createPayroll(data);
            setIsCreateDialogOpen(false);
          } catch (error) {
            toast({
              title: 'Error',
              description: 'Failed to create payroll',
              variant: 'destructive',
            });
          }
        }}
      />

      <ConfirmActionDialog
        open={!!deletePayrollId}
        onOpenChange={() => setDeletePayrollId(null)}
        title="Delete Payroll"
        description="Are you sure you want to delete this payroll? This action cannot be undone."
        onConfirm={handleDelete}
        destructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
