// @ts-ignore
import { DataTable } from '@/components/common/DataTable';
import { ConfirmActionDialog } from '@/components/ConfirmActionDialog';
import { getDeductionColumns } from '@/components/deduction/columns';
import { DeductionDialog } from '@/components/deduction/DeductionDialog';
import { ErrorAlert } from '@/components/ErrorAlert';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useLoading } from '@/contexts/LoadingContext';
import { useDeductions } from '@/hooks/useDeductions';
import { showErrorToast } from '@/lib/error-handler';
import { CreateDeductionDto, Deduction, UpdateDeductionDto } from '@/types/deduction';
import { useQueryClient } from '@tanstack/react-query';
import { Calculator, MinusCircle, User } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

// Import the EnrichedDeduction type from columns.tsx
type EnrichedDeduction = {
  id: string;
  typeName: string;
  description: string;
  effectiveDate: string;
  remarks: string;
  amount: number;
  modifiedAt: string;
  employeeId: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
};

// Helper function to convert EnrichedDeduction to Deduction
const enrichedToDeduction = (enriched: EnrichedDeduction): Deduction => ({
  ...enriched,
  employee: enriched.employee
    ? {
      ...enriched.employee,
      email: '',
      phone: '',
      address: '',
      dateOfJoining: '',
      dateOfLeaving: '',
      departmentId: '',
      jobTitleId: '',
      appUserId: '',
      nic: '',
      yearsOfService: 0,
      currentSalary: 0,
      categoryGroupId: '',
    }
    : null,
});

export default function DeductionsPage() {
  // State management
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDeduction, setSelectedDeduction] = useState<Deduction | undefined>(undefined);
  const [deductionToDelete, setDeductionToDelete] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);

  // Hooks
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { withLoading } = useLoading();

  const {
    deductions: deductionsData = [],
    isLoading,
    error,
    createDeduction: createDeductionMutation,
    updateDeduction: updateDeductionMutation,
    deleteDeduction: deleteDeductionMutation,
    isCreating,
    isUpdating,
    isDeleting,
    refetch: refetchDeductions,
  } = useDeductions();

  // Ensure deductions is always an array and memoize it
  const deductions = useMemo(
    () => (Array.isArray(deductionsData) ? deductionsData : []),
    [deductionsData]
  );

  // Memoize statistics
  const statistics = useMemo(() => {
    const totalAmount = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
    const average = deductions.length > 0 ? totalAmount / deductions.length : 0;
    const uniqueEmployees = new Set(deductions.map((d) => d.employeeId)).size;

    return {
      totalAmount,
      average,
      uniqueEmployees,
      totalCount: deductions.length,
    };
  }, [deductions]);

  // Handlers
  const handleAdd = useCallback(() => {
    setSelectedDeduction(undefined);
    setIsDialogOpen(true);
  }, []);

  const handleEdit = useCallback((deduction: Deduction) => {
    setSelectedDeduction(deduction);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeductionToDelete(id);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deductionToDelete) {
      deleteDeductionMutation(deductionToDelete);
      setIsDeleteDialogOpen(false);
      setDeductionToDelete(null);
    }
  }, [deductionToDelete, deleteDeductionMutation]);

  const handleSubmit = useCallback((data: CreateDeductionDto | UpdateDeductionDto) => {
    if (selectedDeduction) {
      updateDeductionMutation({ id: selectedDeduction.id, data });
    } else {
      createDeductionMutation(data);
    }
    setIsDialogOpen(false);
    setSelectedDeduction(undefined);
  }, [selectedDeduction, updateDeductionMutation, createDeductionMutation]);

  const handleRefresh = useCallback(async () => {
    try {
      await withLoading(refetchDeductions(), 'Refreshing deductions...');
      toast({
        title: 'Success',
        description: 'Deductions refreshed successfully',
      });
    } catch (error) {
      showErrorToast(error, 'refreshing deductions');
    }
  }, [refetchDeductions, withLoading, toast]);

  // Memoize columns
  const tableColumns = useMemo(
    () =>
      getDeductionColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleEdit, handleDelete]
  );

  if (isLoading) return <LoadingOverlay />;
  if (error)
    return <ErrorAlert message={error instanceof Error ? error.message : 'An error occurred'} />;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-red-50/80 to-pink-50/80 dark:from-red-950/40 dark:to-pink-950/40 border-red-200/50 dark:border-red-800/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">Total Deduction Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MinusCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <div className="text-2xl font-bold text-red-800 dark:text-red-200">Rs {statistics.totalAmount.toLocaleString()}</div>
            </div>
            <p className="text-xs text-red-600/70 dark:text-red-300/70">
              Across {statistics.totalCount} deductions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50/80 to-amber-50/80 dark:from-orange-950/40 dark:to-amber-950/40 border-orange-200/50 dark:border-orange-800/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">Average Deduction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                Rs {statistics.average.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
            <p className="text-xs text-orange-600/70 dark:text-orange-300/70">Per deduction</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50/80 to-fuchsia-50/80 dark:from-purple-950/40 dark:to-fuchsia-950/40 border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">Employees with Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">{statistics.uniqueEmployees}</div>
            </div>
            <p className="text-xs text-purple-600/70 dark:text-purple-300/70">Unique employees</p>
          </CardContent>
        </Card>
      </div>

      {/* DataTable with Management Section */}
      <DataTable
        columns={tableColumns}
        data={deductions}
        isLoading={isLoading}
        pagination
        initialPageSize={pageSize}
        searchPlaceholder="Search deductions..."
        title="Deductions"
        subtitle="Manage employee deductions and withholdings"
        actions={
          <Button onClick={handleAdd} variant="default">
            Add Deduction
          </Button>
        }
      />

      {/* Dialogs */}
      <DeductionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={selectedDeduction}
        onSubmit={handleSubmit}
        mode={selectedDeduction ? 'edit' : 'create'}
      />

      <ConfirmActionDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Deduction"
        description="Are you sure you want to delete this deduction? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}
