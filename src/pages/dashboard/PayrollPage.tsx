import { AdminOnly } from '@/components/auth/RoleBasedUI';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmActionDialog } from '@/components/ConfirmActionDialog';
import { getPayrollColumns } from '@/components/payroll/columns';
import { PayrollCalculationDialog } from '@/components/payroll/PayrollCalculationDialog';
import { PayrollDialog } from '@/components/payroll/PayrollDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { usePayroll } from '@/hooks/usePayroll';
import { usePayrollWithEmployees } from '@/hooks/usePayrollWithEmployees';
import { Calculator, Plus } from 'lucide-react';
import { useState } from 'react';

export function PayrollPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCalculationDialogOpen, setIsCalculationDialogOpen] = useState(false);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage and calculate employee payroll records
          </p>
        </div>
        <div className="flex gap-2">
          <AdminOnly>
            <Button
              onClick={() => setIsCalculationDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Payroll
            </Button>
          </AdminOnly>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Payroll
          </Button>
        </div>
      </div>

      {/* Admin Information Card */}
      <AdminOnly>
        <Card className="mb-6 border-blue-200/50 bg-blue-50/80 dark:border-blue-800/50 dark:bg-blue-950/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Calculator className="h-5 w-5" />
              Admin Payroll Functions
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              As an administrator, you can perform payroll calculations and manage payroll records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 p-4 rounded-lg border border-blue-200/50 dark:border-blue-800/50 bg-white/50 dark:bg-blue-950/20">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">Calculate Payroll</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                  Automatically calculate payroll for employees based on their category group,
                  allowances, and deductions. This uses the backend calculation engine.
                </p>
                <Badge variant="outline" className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/50">
                  Payroll Calculation
                </Badge>
              </div>
              <div className="space-y-3 p-4 rounded-lg border border-blue-200/50 dark:border-blue-800/50 bg-white/50 dark:bg-blue-950/20">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">Create Payroll</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                  Manually create payroll records with custom values for basic salary,
                  allowances, and deductions.
                </p>
                <Badge variant="outline" className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/50">
                  Manual Entry
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </AdminOnly>

      <div className="mt-8">
        <DataTable
          columns={columns}
          data={enrichedPayrolls || []}
          searchPlaceholder="Search payrolls..."
        />
      </div>

      {/* Payroll Calculation Dialog */}
      <PayrollCalculationDialog
        open={isCalculationDialogOpen}
        onOpenChange={setIsCalculationDialogOpen}
      />

      {/* Create Payroll Dialog */}
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
