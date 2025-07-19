import { DataTable } from '@/components/common/DataTable';
import { ErrorAlert } from '@/components/ErrorAlert';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentEmployeeId } from '@/hooks/useCurrentEmployeeId';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { AlertTriangle, Calendar, DollarSign, FileText, MinusCircle } from 'lucide-react';
import { useState } from 'react';

interface PersonalDeduction {
  id: string;
  typeName: string;
  amount: number;
  employeeId: string;
  remarks: string;
  effectiveDate?: string;
  modifiedAt?: string;
}

export default function MyDeductionsPage() {
  const { user } = useAuth();
  useToast();
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const { data: currentEmployeeId, isLoading: isLoadingEmployeeId } = useCurrentEmployeeId();

  // Generate year options (current year and 4 previous years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Fetch personal deductions
  const {
    data: deductions = [],
    isLoading,
    error,
    refetch,
  } = useQuery<PersonalDeduction[]>({
    queryKey: ['my-deductions', currentEmployeeId],
    queryFn: async () => {
      if (!currentEmployeeId) {
        throw new Error('Employee ID not found');
      }

      const response = await fetch(
        `/api/Deduction/GetDeductionWith/${currentEmployeeId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch deductions');
      }

      return response.json();
    },
    enabled: !!currentEmployeeId,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter deductions by selected year (if effectiveDate is available)
  const filteredDeductions = deductions.filter((deduction) => {
    if (!deduction.effectiveDate) return true; // Include if no date filter
    const deductionYear = new Date(deduction.effectiveDate).getFullYear().toString();
    return deductionYear === selectedYear;
  });

  // Calculate statistics
  const statistics = {
    totalDeductions: filteredDeductions.length,
    totalAmount: filteredDeductions.reduce((sum, deduction) => sum + deduction.amount, 0),
    averageAmount:
      filteredDeductions.length > 0
        ? filteredDeductions.reduce((sum, deduction) => sum + deduction.amount, 0) /
        filteredDeductions.length
        : 0,
    mostRecentDeduction:
      filteredDeductions.length > 0 && filteredDeductions.some((d) => d.effectiveDate)
        ? filteredDeductions
          .filter((d) => d.effectiveDate)
          .reduce((latest, deduction) =>
            new Date(deduction.effectiveDate!) > new Date(latest.effectiveDate!)
              ? deduction
              : latest
          )
        : null,
  };

  // Define columns for the data table
  const columns: ColumnDef<PersonalDeduction>[] = [
    {
      accessorKey: 'typeName',
      header: 'Type',
      cell: ({ row }) => <div className="font-medium">{row.getValue('typeName')}</div>,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <div className="font-bold text-red-600">
          Rs {Number(row.getValue('amount')).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: 'effectiveDate',
      header: 'Effective Date',
      cell: ({ row }) => {
        const date = row.getValue('effectiveDate') as string;
        return <div className="text-sm">{date ? format(new Date(date), 'PPP') : 'N/A'}</div>;
      },
    },
    {
      accessorKey: 'remarks',
      header: 'Remarks',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue('remarks')}>
          {row.getValue('remarks') || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'modifiedAt',
      header: 'Last Modified',
      cell: ({ row }) => {
        const date = row.getValue('modifiedAt') as string;
        return (
          <div className="text-sm text-muted-foreground">
            {date ? format(new Date(date), 'PPp') : 'N/A'}
          </div>
        );
      },
    },
  ];

  // Show loading state while fetching employee ID
  if (isLoadingEmployeeId) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-muted-foreground">Loading employee information...</p>
        </div>
      </div>
    );
  }

  if (!currentEmployeeId) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertDescription>
            Unable to determine your employee ID. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-muted-foreground">Loading your deductions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <ErrorAlert
          message={error instanceof Error ? error.message : 'Failed to load deductions'}
        />
        <div className="mt-4">
          <button
            onClick={() => refetch()}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Deductions</h1>
          <p className="text-muted-foreground">View your personal deductions and withholdings</p>
        </div>
        <div className="flex items-center gap-2">
          <MinusCircle className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      </div>

      {/* Year Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter by Year</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-xs">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div className="text-2xl font-bold">{statistics.totalDeductions}</div>
            </div>
            <p className="text-xs text-muted-foreground">Active deductions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-red-600" />
              <div className="text-2xl font-bold text-red-600">
                Rs {statistics.totalAmount.toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Total deductions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MinusCircle className="h-4 w-4 text-orange-600" />
              <div className="text-2xl font-bold">
                Rs{' '}
                {statistics.averageAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Per deduction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Recent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div className="text-lg font-bold">
                {statistics.mostRecentDeduction ? (
                  <>
                    <div className="text-sm font-medium">
                      {statistics.mostRecentDeduction.typeName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(statistics.mostRecentDeduction.effectiveDate!), 'MMM yyyy')}
                    </div>
                  </>
                ) : (
                  'N/A'
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Latest deduction</p>
          </CardContent>
        </Card>
      </div>

      {/* Important Notice */}
      {statistics.totalAmount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> These deductions are automatically applied to your payroll.
            For questions about specific deductions, please contact HR or your manager.
          </AlertDescription>
        </Alert>
      )}

      {/* Deductions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Deductions for {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDeductions.length === 0 ? (
            <div className="py-8 text-center">
              <MinusCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No deductions found</h3>
              <p className="text-muted-foreground">No deductions found for the selected year.</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredDeductions}
              searchPlaceholder="Search deductions..."
              pagination
              initialPageSize={10}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
