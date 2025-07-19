import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useCurrentEmployeeId } from '@/hooks/useCurrentEmployeeId';
import { useMyLeaveBalance } from '@/hooks/useLeaveBalance';
import { AlertCircle, Calendar } from 'lucide-react';

interface LeaveBalanceDisplayProps {
    selectedLeaveTypeId?: string;
    startDate?: string;
    endDate?: string;
}

export function LeaveBalanceDisplay({
    selectedLeaveTypeId,
    startDate,
    endDate
}: LeaveBalanceDisplayProps) {
    const { data: currentEmployeeId } = useCurrentEmployeeId();
    const currentYear = new Date().getFullYear();

    const { data: leaveBalance, isLoading, error } = useMyLeaveBalance(
        typeof currentEmployeeId === 'string' ? currentEmployeeId : '',
        currentYear
    );

    if (isLoading) {
        return (
            <Card className="mb-4">
                <CardContent className="py-4">
                    <div className="flex items-center justify-center">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading leave balance...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="mb-4 border-yellow-200 bg-yellow-50">
                <CardContent className="py-4">
                    <div className="flex items-center text-yellow-800">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">Unable to load leave balance</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!leaveBalance) {
        return (
            <Card className="mb-4 border-blue-200 bg-blue-50">
                <CardContent className="py-4">
                    <div className="flex items-center text-blue-800">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">No leave balance information available</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Calculate requested days if dates are provided
    let requestedDays = 0;
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        requestedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    }

    // Handle different response structures
    let balanceData: any[] = [];
    if (Array.isArray(leaveBalance)) {
        balanceData = leaveBalance;
    } else if (leaveBalance && typeof leaveBalance === 'object' && 'balances' in leaveBalance && Array.isArray((leaveBalance as any).balances)) {
        balanceData = (leaveBalance as any).balances;
    } else if (leaveBalance && typeof leaveBalance === 'object' && 'leaveTypeId' in leaveBalance) {
        // Single leave balance object
        balanceData = [leaveBalance];
    }

    // Debug logging
    console.log('Leave balance data structure:', {
        originalData: leaveBalance,
        processedData: balanceData,
        isArray: Array.isArray(leaveBalance),
        hasBalances: leaveBalance && typeof leaveBalance === 'object' && 'balances' in leaveBalance,
        balanceCount: balanceData.length
    });

    const selectedBalance = selectedLeaveTypeId
        ? balanceData.find((balance: any) => balance.leaveTypeId === selectedLeaveTypeId)
        : null;

    return (
        <Card className="mb-4">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {balanceData.map((balance: any, index: number) => (
                    <div
                        key={`${balance.leaveTypeId}-${index}`}
                        className={`flex items-center justify-between p-3 rounded-lg border ${selectedLeaveTypeId === balance.leaveTypeId
                            ? 'border-blue-200 bg-blue-50'
                            : 'border-gray-200'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{balance.leaveTypeName}</span>
                            {selectedLeaveTypeId === balance.leaveTypeId && (
                                <Badge variant="outline" className="text-xs">Selected</Badge>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-semibold">
                                {balance.remainingDays} / {balance.allocatedDays} days
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Used: {balance.usedDays} days
                            </div>
                            {selectedLeaveTypeId === balance.leaveTypeId && requestedDays > 0 && (
                                <div className={`text-xs ${requestedDays <= balance.remainingDays
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                    }`}>
                                    {requestedDays <= balance.remainingDays
                                        ? `✓ Sufficient balance`
                                        : `✗ Insufficient balance (need ${requestedDays - balance.remainingDays} more days)`
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {selectedLeaveTypeId && requestedDays > 0 && selectedBalance && (
                    <div className={`mt-3 p-3 rounded-lg text-sm ${requestedDays <= selectedBalance.remainingDays
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                        <div className="flex items-center">
                            {requestedDays <= selectedBalance.remainingDays ? (
                                <Calendar className="h-4 w-4 mr-2" />
                            ) : (
                                <AlertCircle className="h-4 w-4 mr-2" />
                            )}
                            <span>
                                {requestedDays <= selectedBalance.remainingDays
                                    ? `You have sufficient leave balance for ${requestedDays} day(s)`
                                    : `Insufficient leave balance. You need ${requestedDays - selectedBalance.remainingDays} more day(s)`
                                }
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 