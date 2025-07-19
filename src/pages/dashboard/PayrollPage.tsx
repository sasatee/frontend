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
import { Calculator, DollarSign, Plus, TrendingUp, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

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

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!enrichedPayrolls || enrichedPayrolls.length === 0) {
      return {
        totalPayrolls: 0,
        totalNetPay: 0,
        averageNetPay: 0,
        totalEmployees: 0,
      };
    }

    const totalNetPay = enrichedPayrolls.reduce((sum, payroll) => sum + (payroll.netPay || 0), 0);
    const uniqueEmployees = new Set(enrichedPayrolls.map(p => p.employeeId)).size;

    return {
      totalPayrolls: enrichedPayrolls.length,
      totalNetPay,
      averageNetPay: totalNetPay / enrichedPayrolls.length,
      totalEmployees: uniqueEmployees,
    };
  }, [enrichedPayrolls]);

  // Filterable columns
  const filterableColumns = useMemo(() => [
    {
      id: 'employee',
      title: 'Employee',
      options: enrichedPayrolls?.map((payroll) => ({
        label: payroll.employee?.firstName && payroll.employee?.lastName
          ? `${payroll.employee.firstName} ${payroll.employee.lastName}`
          : 'Unknown Employee',
        value: payroll.employee?.firstName && payroll.employee?.lastName
          ? `${payroll.employee.firstName} ${payroll.employee.lastName}`
          : 'Unknown Employee',
      })) || [],
    },
  ], [enrichedPayrolls]);

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

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payrolls</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalPayrolls}</div>
            <p className="text-xs text-muted-foreground">Payroll records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Net Pay</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summaryStats.totalNetPay.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Combined net pay</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Net Pay</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summaryStats.averageNetPay.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per payroll record</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">With payroll records</p>
          </CardContent>
        </Card>
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

      <DataTable
        columns={columns}
        data={enrichedPayrolls || []}
        isLoading={isLoadingEnriched}
        searchPlaceholder="Search by employee name, ID, or pay amount..."
        title="Payroll Records"
        subtitle="View and manage employee payroll information"
        filterableColumns={filterableColumns}
        actions={
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
        }
        initialSortColumn="payDate"
        initialSortDirection="desc"
        emptyMessage="No payroll records found. Create your first payroll record to get started."
      />

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
