// @ts-ignore
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
import { BadgeDollarSign, Calendar, DollarSign, FileText } from 'lucide-react';
import { useState } from 'react';

interface PersonalAllowance {
  id: string;
  typeName: string;
  description: string;
  effectiveDate: string;
  remarks: string;
  amount: number;
  modifiedAt: string;
  employeeId: string;
}

export default function MyAllowancesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const { data: currentEmployeeId, isLoading: isLoadingEmployeeId } = useCurrentEmployeeId();

  // Generate year options (current year and 4 previous years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Fetch personal allowances
  const {
    data: allowances = [],
    isLoading,
    error,
    refetch,
  } = useQuery<PersonalAllowance[]>({
    queryKey: ['my-allowances', currentEmployeeId],
    queryFn: async () => {
      if (!currentEmployeeId) {
        throw new Error('Employee ID not found');
      }

      const response = await fetch(
        `/api/Allowance/GetAllowanceWith/${currentEmployeeId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch allowances');
      }

      return response.json();
    },
    enabled: !!currentEmployeeId,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter allowances by selected year
  const filteredAllowances = allowances.filter((allowance) => {
    const allowanceYear = new Date(allowance.effectiveDate).getFullYear().toString();
    return allowanceYear === selectedYear;
  });

  // Calculate statistics
  const statistics = {
    totalAllowances: filteredAllowances.length,
    totalAmount: filteredAllowances.reduce((sum, allowance) => sum + allowance.amount, 0),
    averageAmount:
      filteredAllowances.length > 0
        ? filteredAllowances.reduce((sum, allowance) => sum + allowance.amount, 0) /
        filteredAllowances.length
        : 0,
    mostRecentAllowance:
      filteredAllowances.length > 0
        ? filteredAllowances.reduce((latest, allowance) =>
          new Date(allowance.effectiveDate) > new Date(latest.effectiveDate) ? allowance : latest
        )
        : null,
  };

  // Define columns for the data table
  const columns: ColumnDef<PersonalAllowance>[] = [
    {
      accessorKey: 'typeName',
      header: 'Type',
      cell: ({ row }) => <div className="font-medium">{row.getValue('typeName')}</div>,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue('description')}>
          {row.getValue('description') || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <div className="font-bold text-green-600">
          Rs {Number(row.getValue('amount')).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: 'effectiveDate',
      header: 'Effective Date',
      cell: ({ row }) => (
        <div className="text-sm">{format(new Date(row.getValue('effectiveDate')), 'PPP')}</div>
      ),
    },
    {
      accessorKey: 'remarks',
      header: 'Remarks',
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate" title={row.getValue('remarks')}>
          {row.getValue('remarks') || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'modifiedAt',
      header: 'Last Modified',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {format(new Date(row.getValue('modifiedAt')), 'PPp')}
        </div>
      ),
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
          <p className="mt-4 text-sm text-muted-foreground">Loading your allowances...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <ErrorAlert
          message={error instanceof Error ? error.message : 'Failed to load allowances'}
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
          <h1 className="text-3xl font-bold tracking-tight">My Allowances</h1>
          <p className="text-muted-foreground">View your personal allowances and benefits</p>
        </div>
        <div className="flex items-center gap-2">
          <BadgeDollarSign className="h-5 w-5 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Total Allowances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div className="text-2xl font-bold">{statistics.totalAllowances}</div>
            </div>
            <p className="text-xs text-muted-foreground">Active allowances</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div className="text-2xl font-bold">Rs {statistics.totalAmount.toLocaleString()}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total allowances</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BadgeDollarSign className="h-4 w-4 text-emerald-600" />
              <div className="text-2xl font-bold">
                Rs{' '}
                {statistics.averageAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Per allowance</p>
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
                {statistics.mostRecentAllowance ? (
                  <>
                    <div className="text-sm font-medium">
                      {statistics.mostRecentAllowance.typeName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(statistics.mostRecentAllowance.effectiveDate), 'MMM yyyy')}
                    </div>
                  </>
                ) : (
                  'N/A'
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Latest allowance</p>
          </CardContent>
        </Card>
      </div>

      {/* Allowances Table */}
      <Card>
        <CardHeader>
          <CardTitle>Allowances for {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAllowances.length === 0 ? (
            <div className="py-8 text-center">
              <BadgeDollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No allowances found</h3>
              <p className="text-muted-foreground">No allowances found for the selected year.</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredAllowances}
              searchPlaceholder="Search allowances..."
              pagination
              initialPageSize={10}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
