import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { useToast } from '@/components/ui/use-toast';
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle, User } from 'lucide-react';
import { format, parseISO, isToday, differenceInHours } from 'date-fns';
import { getCurrentUserEmployeeId } from '@/lib/data-access-control';
import { DataTable } from '@/components/common/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AttendanceStatusBadge } from '@/components/attendance/AttendanceStatusBadge';

interface PersonalAttendance {
  id: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  overtimeHours: number;
  employeeId: string;
  status?: 'present' | 'absent' | 'late' | 'early_departure';
}

export default function MyAttendancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

  const currentEmployeeId = getCurrentUserEmployeeId();

  // Generate month options (current month and 11 previous months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy'),
    };
  });

  // Fetch personal attendance
  const {
    data: attendanceRecords = [],
    isLoading,
    error,
    refetch,
  } = useQuery<PersonalAttendance[]>({
    queryKey: ['my-attendance', currentEmployeeId, selectedMonth],
    queryFn: async () => {
      if (!currentEmployeeId) {
        throw new Error('Employee ID not found');
      }

      const response = await fetch(
        `/api/Attendance/employee/${currentEmployeeId}?month=${selectedMonth}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch attendance records');
      }

      return response.json();
    },
    enabled: !!currentEmployeeId,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter attendance by selected month
  const filteredAttendance = attendanceRecords.filter((record) => {
    const recordMonth = format(parseISO(record.date), 'yyyy-MM');
    return recordMonth === selectedMonth;
  });

  // Calculate statistics
  const statistics = {
    totalDays: filteredAttendance.length,
    presentDays: filteredAttendance.filter((record) => record.checkInTime && record.checkOutTime)
      .length,
    absentDays: filteredAttendance.filter((record) => !record.checkInTime || !record.checkOutTime)
      .length,
    totalHours: filteredAttendance.reduce((sum, record) => {
      if (record.checkInTime && record.checkOutTime) {
        const hours = differenceInHours(
          parseISO(record.checkOutTime),
          parseISO(record.checkInTime)
        );
        return sum + hours;
      }
      return sum;
    }, 0),
    overtimeHours: filteredAttendance.reduce((sum, record) => sum + (record.overtimeHours || 0), 0),
    averageHours:
      filteredAttendance.length > 0
        ? filteredAttendance.reduce((sum, record) => {
            if (record.checkInTime && record.checkOutTime) {
              const hours = differenceInHours(
                parseISO(record.checkOutTime),
                parseISO(record.checkInTime)
              );
              return sum + hours;
            }
            return sum;
          }, 0) / filteredAttendance.filter((r) => r.checkInTime && r.checkOutTime).length
        : 0,
  };

  // Calculate attendance rate
  const attendanceRate =
    statistics.totalDays > 0 ? (statistics.presentDays / statistics.totalDays) * 100 : 0;

  // Define columns for the data table
  const columns: ColumnDef<PersonalAttendance>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const date = parseISO(row.getValue('date'));
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{format(date, 'PPP')}</div>
              <div className="text-sm text-muted-foreground">{format(date, 'EEEE')}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'checkInTime',
      header: 'Check In',
      cell: ({ row }) => {
        const checkIn = row.getValue('checkInTime') as string;
        return (
          <div className="text-sm">
            {checkIn ? (
              format(parseISO(checkIn), 'HH:mm')
            ) : (
              <span className="text-red-500">Not checked in</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'checkOutTime',
      header: 'Check Out',
      cell: ({ row }) => {
        const checkOut = row.getValue('checkOutTime') as string;
        return (
          <div className="text-sm">
            {checkOut ? (
              format(parseISO(checkOut), 'HH:mm')
            ) : (
              <span className="text-red-500">Not checked out</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'workHours',
      header: 'Work Hours',
      cell: ({ row }) => {
        const checkIn = row.getValue('checkInTime') as string;
        const checkOut = row.getValue('checkOutTime') as string;

        if (!checkIn || !checkOut) {
          return <span className="text-muted-foreground">N/A</span>;
        }

        const hours = differenceInHours(parseISO(checkOut), parseISO(checkIn));
        return <div className="font-medium">{hours.toFixed(1)}h</div>;
      },
    },
    {
      accessorKey: 'overtimeHours',
      header: 'Overtime',
      cell: ({ row }) => {
        const overtime = row.getValue('overtimeHours') as number;
        return (
          <div
            className={`font-medium ${overtime > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}
          >
            {overtime > 0 ? `${overtime.toFixed(1)}h` : 'None'}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const checkIn = row.getValue('checkInTime') as string;
        const checkOut = row.getValue('checkOutTime') as string;

        if (!checkIn) {
          return <Badge variant="destructive">Absent</Badge>;
        }

        if (!checkOut) {
          return <Badge variant="outline">In Progress</Badge>;
        }

        // You can add more logic here for late/early departure based on company rules
        return <Badge variant="default">Present</Badge>;
      },
    },
  ];

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
          <p className="mt-4 text-sm text-muted-foreground">Loading your attendance records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <ErrorAlert
          title="Error Loading Attendance"
          message={error instanceof Error ? error.message : 'Failed to load attendance records'}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
          <p className="text-muted-foreground">View your attendance records and work hours</p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      </div>

      {/* Month Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-xs">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
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
            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div className="text-2xl font-bold">{statistics.totalDays}</div>
            </div>
            <p className="text-xs text-muted-foreground">Working days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Present Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{statistics.presentDays}</div>
            </div>
            <p className="text-xs text-muted-foreground">
              {attendanceRate.toFixed(1)}% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <div className="text-2xl font-bold">{statistics.totalHours.toFixed(1)}h</div>
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {statistics.averageHours.toFixed(1)}h/day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">
                {statistics.overtimeHours.toFixed(1)}h
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Extra hours worked</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Performance Alert */}
      {attendanceRate < 80 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Attendance Notice:</strong> Your attendance rate is {attendanceRate.toFixed(1)}
            %. Please maintain regular attendance to meet company standards.
          </AlertDescription>
        </Alert>
      )}

      {/* Attendance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Attendance Records for {format(parseISO(selectedMonth + '-01'), 'MMMM yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAttendance.length === 0 ? (
            <div className="py-8 text-center">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No attendance records found</h3>
              <p className="text-muted-foreground">
                No attendance records found for the selected month.
              </p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredAttendance}
              searchPlaceholder="Search attendance records..."
              pagination
              initialPageSize={10}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
