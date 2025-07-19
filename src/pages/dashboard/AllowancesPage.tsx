import { AllowanceDialog } from '@/components/allowance/AllowanceDialog';
import { columns } from '@/components/allowance/columns';
import { DataTable } from '@/components/common/DataTable';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { ErrorAlert } from '@/components/ErrorAlert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useLoading } from '@/contexts/LoadingContext';
import { useEmployees } from '@/hooks/useEmployees';
import { showErrorToast } from '@/lib/error-handler';
import { deleteAllowance, getAllAllowances } from '@/services/allowanceService';
import { Allowance } from '@/types/allowance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeDollarSign, Calculator, User } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

// Import the EnrichedAllowance type from columns.tsx
type EnrichedAllowance = {
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

// Helper function to convert EnrichedAllowance to Allowance
const enrichedToAllowance = (enriched: EnrichedAllowance): Allowance => ({
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

export default function AllowancesPage() {
  // State management
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAllowance, setSelectedAllowance] = useState<Allowance | null>(null);
  const [pageSize, setPageSize] = useState(10);

  // Hooks
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { withLoading } = useLoading();

  // Fetch data
  const { data: employees = [] } = useEmployees();

  const {
    data: allowancesData = [],
    isLoading,
    error: allowanceError,
    refetch: refetchAllowances,
  } = useQuery<EnrichedAllowance[]>({
    queryKey: ['allowances', employees],
    queryFn: async () => {
      try {
        const data = await withLoading(getAllAllowances(), 'Loading allowances...');
        return data.map((allowance) => {
          if (allowance.employee) {
            return {
              ...allowance,
              employee: {
                id: allowance.employee.id,
                firstName: allowance.employee.firstName,
                lastName: allowance.employee.lastName,
              },
            };
          }

          const matchingEmployee = employees?.find((emp) => emp.id === allowance.employeeId);
          return {
            ...allowance,
            employee: matchingEmployee
              ? {
                id: matchingEmployee.id,
                firstName: matchingEmployee.firstName,
                lastName: matchingEmployee.lastName,
              }
              : null,
          };
        });
      } catch (error) {
        showErrorToast(error, 'fetching allowances');
        return [];
      }
    },
    enabled: employees.length > 0,
    staleTime: STALE_TIME,
  });

  // Ensure allowances is always an array and memoize it
  const allowances = useMemo(
    () => (Array.isArray(allowancesData) ? allowancesData : []),
    [allowancesData]
  );

  // Memoize statistics
  const statistics = useMemo(() => {
    const totalAmount = allowances.reduce((sum, allowance) => sum + allowance.amount, 0);
    const average = allowances.length > 0 ? totalAmount / allowances.length : 0;
    const uniqueEmployees = new Set(allowances.map((a) => a.employeeId)).size;

    return {
      totalAmount,
      average,
      uniqueEmployees,
      totalCount: allowances.length,
    };
  }, [allowances]);

  // Handlers
  const handleCreate = useCallback(() => {
    setSelectedAllowance(null);
    setIsCreateDialogOpen(true);
  }, []);

  const handleEdit = useCallback((allowance: EnrichedAllowance) => {
    setSelectedAllowance(enrichedToAllowance(allowance));
    setIsCreateDialogOpen(true);
  }, []);

  const handleDelete = useCallback((allowance: EnrichedAllowance) => {
    setSelectedAllowance(enrichedToAllowance(allowance));
    setIsDeleteDialogOpen(true);
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      await withLoading(refetchAllowances(), 'Refreshing allowances...');
      toast({
        title: 'Success',
        description: 'Allowances refreshed successfully',
      });
    } catch (error) {
      showErrorToast(error, 'refreshing allowances');
    }
  }, [refetchAllowances, withLoading, toast]);

  // Memoize columns
  const tableColumns = useMemo(
    () =>
      columns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleEdit, handleDelete]
  );

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await withLoading(deleteAllowance(id), 'Deleting allowance...');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowances'] });
      toast({
        title: 'Success',
        description: 'Allowance deleted successfully',
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      showErrorToast(error, 'deleting allowance');
    },
  });

  // Error handling
  if (allowanceError) {
    return <ErrorAlert message="Failed to load allowances" />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Allowance Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BadgeDollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">Rs {statistics.totalAmount.toLocaleString()}</div>
            </div>
            <p className="text-xs text-blue-600/70 dark:text-blue-300/70">
              Across {statistics.totalCount} allowances
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/40 dark:to-emerald-950/40 border-green-200/50 dark:border-green-800/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Average Allowance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-green-600 dark:text-green-400" />
              <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                Rs {statistics.average.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
            <p className="text-xs text-green-600/70 dark:text-green-300/70">Per allowance</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50/80 to-fuchsia-50/80 dark:from-purple-950/40 dark:to-fuchsia-950/40 border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">Employees with Allowances</CardTitle>
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

      <DataTable<EnrichedAllowance, unknown>
        columns={tableColumns}
        data={allowances}
        isLoading={isLoading}
        pagination
        initialPageSize={pageSize}
        searchPlaceholder="Search allowances..."
        title="Allowances"
        subtitle="Manage employee allowances and bonuses"
        actions={
          <Button onClick={handleCreate} variant="default">
            Add Allowance
          </Button>
        }
      />

      <AllowanceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        allowance={selectedAllowance}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Allowance"
        description={`Are you sure you want to delete this allowance? This action cannot be undone.`}
        onConfirm={() => selectedAllowance?.id && deleteMutation.mutate(selectedAllowance.id)}
      />
    </div>
  );
}
