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
import { useAuth } from '@/hooks/useAuth';
import { useCurrentEmployeeId } from '@/hooks/useCurrentEmployeeId';
import { useLeaveBalance } from '@/hooks/useLeaveBalance';
import { useLeaveTypes } from '@/hooks/useLeaveTypes';
import { useState } from 'react';

// Function to convert technical error messages to user-friendly messages
const getUserFriendlyErrorMessage = (
  errorMessage: string,
  selectedYear: number,
  selectedLeaveTypeId: string,
  leaveTypes: any[]
): string => {
  // Check for common error patterns and provide user-friendly messages
  if (errorMessage.includes('No leave allocation found')) {
    const leaveTypeName = selectedLeaveTypeId === 'all' 
      ? 'any leave type' 
      : leaveTypes.find(lt => lt.id === selectedLeaveTypeId)?.name || 'the selected leave type';
    
    return `No leave allocation found for ${selectedYear}. This means you haven't been allocated any ${leaveTypeName} for this year. Please contact your HR administrator to set up your leave allocation.`;
  }
  
  if (errorMessage.includes('Employee not found')) {
    return 'Your employee profile could not be found. Please contact your HR administrator to verify your employee record.';
  }
  
  if (errorMessage.includes('Leave type not found')) {
    return 'The selected leave type could not be found. Please try selecting a different leave type or contact your HR administrator.';
  }
  
  if (errorMessage.includes('Access denied') || errorMessage.includes('Unauthorized')) {
    return 'You do not have permission to view this leave balance. Please contact your HR administrator if you believe this is an error.';
  }
  
  if (errorMessage.includes('Server error') || errorMessage.includes('Internal server error')) {
    return 'We are experiencing technical difficulties. Please try again later or contact your HR administrator if the problem persists.';
  }
  
  if (errorMessage.includes('Network error') || errorMessage.includes('Failed to fetch')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }
  
  // For any other errors, provide a generic but helpful message
  return 'Unable to load your leave balance at this time. Please try again or contact your HR administrator for assistance.';
};

export default function LeaveBalancePage() {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState<string>('all');
  const { data: leaveTypes = [] } = useLeaveTypes();

  // Get current employee ID using the new hook
  const { data: currentEmployeeId, isLoading: isLoadingEmployeeId } = useCurrentEmployeeId();

  // Fetch leave balance data
  const {
    data: leaveBalanceData,
    isLoading: isLoadingBalance,
    error: balanceError
  } = useLeaveBalance({
    employeeId: currentEmployeeId && typeof currentEmployeeId === 'string' ? currentEmployeeId : '',
    period: selectedYear,
    leaveTypeId: selectedLeaveTypeId === 'all' ? undefined : selectedLeaveTypeId,
    enabled: !!currentEmployeeId,
  });

  // Debug logging
  console.log('LeaveBalancePage Debug:', {
    currentEmployeeId,
    selectedYear,
    selectedLeaveTypeId,
    leaveBalanceData,
    isLoadingBalance,
    balanceError,
    enabled: !!currentEmployeeId
  });

  // Test function to manually call the API
  const testLeaveBalanceAPI = async () => {
    if (!currentEmployeeId) {
      console.log('No employee ID available');
      return;
    }

    try {
      const response = await fetch(`/api/LeaveAllocation/balance/${currentEmployeeId}/${selectedYear}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Manual API call response status:', response.status);
      const data = await response.json();
      console.log('Manual API call response data:', data);
    } catch (error) {
      console.error('Manual API call error:', error);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Show loading state while fetching employee ID
  if (isLoadingEmployeeId) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center">
          <LoadingSpinner />
          <span className="ml-2">Loading employee information...</span>
        </div>
      </div>
    );
  }

  // Show error if employee ID not found
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

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Balance</h1>
          <p className="text-muted-foreground">View your available leave balance</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Select Year</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Leave Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedLeaveTypeId} onValueChange={setSelectedLeaveTypeId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Leave Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leave Types</SelectItem>
                {leaveTypes
                  .filter((leaveType) => leaveType.id && leaveType.id !== '')
                  .map((leaveType) => (
                    <SelectItem key={leaveType.id} value={leaveType.id}>
                      {leaveType.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>



      {/* Error Alert */}
      {balanceError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            {getUserFriendlyErrorMessage(balanceError.message, selectedYear, selectedLeaveTypeId, leaveTypes)}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoadingBalance && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-2">Loading leave balance...</span>
        </div>
      )}

      {/* Leave Balance Display */}
      {!isLoadingBalance && leaveBalanceData && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {selectedLeaveTypeId === 'all' ? (
            // Show all leave types with balance
            'balances' in leaveBalanceData && Array.isArray(leaveBalanceData.balances) ? (
              leaveBalanceData.balances.map((balance: any) => (
                <Card key={balance.leaveTypeId} className="p-4">
                  <CardHeader>
                    <CardTitle>{balance.leaveTypeName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Allocated:</span>
                      <span className="font-medium">{balance.allocatedDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Used:</span>
                      <span className="font-medium text-orange-600">{balance.usedDays} days</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">Remaining:</span>
                      <span className="font-bold text-green-600">{balance.remainingDays} days</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Fallback to leave types without balance data
              leaveTypes.map((leaveType) => (
                <Card key={leaveType.id} className="p-4">
                  <CardHeader>
                    <CardTitle>{leaveType.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Default Days: {leaveType.defaultDays} days</p>
                    <p className="text-sm text-muted-foreground">
                      Balance information not available
                    </p>
                  </CardContent>
                </Card>
              ))
            )
          ) : (
            // Show specific leave type balance
            'balances' in leaveBalanceData && Array.isArray(leaveBalanceData.balances) ? (
              leaveBalanceData.balances.map((balance: any) => (
                <Card key={balance.leaveTypeId} className="p-4">
                  <CardHeader>
                    <CardTitle>{balance.leaveTypeName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Allocated:</span>
                      <span className="font-medium">{balance.allocatedDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Used:</span>
                      <span className="font-medium text-orange-600">{balance.usedDays} days</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">Remaining:</span>
                      <span className="font-bold text-green-600">{balance.remainingDays} days</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Single balance object
              <Card className="p-4">
                <CardHeader>
                  <CardTitle>{(leaveBalanceData as any).leaveTypeName || 'Leave Balance'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Allocated:</span>
                    <span className="font-medium">{(leaveBalanceData as any).allocatedDays || 0} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Used:</span>
                    <span className="font-medium text-orange-600">{(leaveBalanceData as any).usedDays || 0} days</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Remaining:</span>
                    <span className="font-bold text-green-600">{(leaveBalanceData as any).remainingDays || 0} days</span>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}

      {/* No Data State */}
      {!isLoadingBalance && !leaveBalanceData && !balanceError && (
        <Card className="p-8">
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              No leave balance data available for {selectedYear}.
            </p>
            <p className="text-sm text-muted-foreground">
              This could mean:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• You haven't been allocated any leave for this year yet</li>
              <li>• Your leave allocation is still being processed</li>
              <li>• There might be a delay in the system</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Please contact your HR administrator if you need assistance with your leave allocation.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
