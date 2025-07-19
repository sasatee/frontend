import { ErrorAlert } from '@/components/ErrorAlert';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEmployeePayroll } from '@/hooks/useEmployeePayroll';
import { format } from 'date-fns';
import { Calendar, DollarSign, Download, FileText, Minus, Plus, Receipt } from 'lucide-react';
import { useState } from 'react';

interface PayrollRecord {
  id: string;
  payDate: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  employeeId: string;
  employee?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function MyPayrollPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Use the new employee payroll hook
  const {
    payrollRecords,
    totalAllowances,
    totalDeductions,
    isLoading,
    error,
    refetch,
    currentEmployeeId,
  } = useEmployeePayroll();



  // Ensure payrollRecords is an array and handle different response structures
  const filteredRecords = Array.isArray(payrollRecords) ? payrollRecords : [];

  // Calculate statistics using totals from the hook
  const statistics = {
    totalRecords: filteredRecords.length,
    totalEarnings: filteredRecords.reduce((sum: number, record: PayrollRecord) => sum + (record.netPay || 0), 0),
    totalAllowances: totalAllowances,
    totalDeductions: totalDeductions,
    averageNetPay:
      filteredRecords.length > 0
        ? filteredRecords.reduce((sum: number, record: PayrollRecord) => sum + (record.netPay || 0), 0) / filteredRecords.length
        : 0,
  };

  // Download payslip as PDF
  const handleDownloadPayslip = async (payrollId: string, payDate: string) => {
    try {
      setIsDownloading(payrollId);

      const response = await fetch(`/api/Payroll/pdf/${payrollId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download payslip');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${format(new Date(payDate), 'yyyy-MM')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'Payslip downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to download payslip',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(null);
    }
  };

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
          <p className="mt-4 text-sm text-muted-foreground">Loading your payroll records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <ErrorAlert
          message={error instanceof Error ? error.message : 'Failed to load payroll records'}
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
          <h1 className="text-3xl font-bold tracking-tight">My Payroll</h1>
          <p className="text-muted-foreground">View your payroll records and download payslips</p>
        </div>
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      </div>

      {/* Note: Backend doesn't support year/month filtering - showing all records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          {/* <p className="text-sm text-muted-foreground">
            Showing all payroll records. Year/month filtering is not supported by the backend.
          </p> */}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div className="text-2xl font-bold">{statistics.totalRecords}</div>
            </div>
            <p className="text-xs text-muted-foreground">Payroll records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div className="text-2xl font-bold">
                Rs {statistics.totalEarnings.toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Net pay total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Allowances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-600" />
              <div className="text-2xl font-bold">
                Rs {statistics.totalAllowances.toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Allowances total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Minus className="h-4 w-4 text-red-600" />
              <div className="text-2xl font-bold">
                Rs {statistics.totalDeductions.toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Deductions total</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Records */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Payroll Records</h2>

        {!filteredRecords || filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No payroll records found</h3>
              <p className="text-muted-foreground">
                No payroll records found. This could be because:
              </p>
              <ul className="mt-2 text-sm text-muted-foreground">
                <li>• No payroll data has been generated yet</li>
                <li>• The API endpoint is not returning data in the expected format</li>
                <li>• There might be an issue with the backend service</li>
              </ul>
              <div className="mt-4">
                <Button onClick={() => refetch()} variant="outline">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredRecords.map((record) => (
              <Card key={record.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {format(new Date(record.payDate), 'MMMM yyyy')}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Pay Date: {format(new Date(record.payDate), 'PPP')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPayslip(record.id, record.payDate)}
                      disabled={isDownloading === record.id}
                    >
                      {isDownloading === record.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      <span className="ml-2">Download Payslip</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm font-medium">Basic Salary</p>
                      <p className="text-lg font-bold">Rs {record.basicSalary.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-600">Allowances</p>
                      <p className="text-lg font-bold text-green-600">
                        +Rs {record.allowances.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-600">Deductions</p>
                      <p className="text-lg font-bold text-red-600">
                        -Rs {record.deductions.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Net Pay</p>
                      <p className="text-xl font-bold text-primary">
                        Rs {record.netPay.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
