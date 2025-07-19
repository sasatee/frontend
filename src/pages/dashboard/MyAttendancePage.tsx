import { DataTable } from '@/components/common/DataTable';
import { ErrorAlert } from '@/components/ErrorAlert';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
import { useEmployeeAttendance } from '@/hooks/useEmployeeAttendance';
import { ColumnDef } from '@tanstack/react-table';
import { differenceInHours, format, isValid, parseISO } from 'date-fns';
import { AlertCircle, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';

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

  // Generate month options (current month and 11 previous months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy'),
    };
  });

  // Use the new employee attendance hook
  const {
    attendanceRecords,
    isLoading,
    error,
    refetch,
    currentEmployeeId,
  } = useEmployeeAttendance({
    month: selectedMonth,
  });

  // Filter attendance by selected month (already filtered by API, but keeping for consistency)
  const filteredAttendance = attendanceRecords.filter((record) => {
    if (!record.date || !isValid(parseISO(record.date))) {
      return false;
    }
    const recordMonth = format(parseISO(record.date), 'yyyy-MM');
    return recordMonth === selectedMonth;
  });

  // Calculate statistics
  const validAttendanceRecords = filteredAttendance.filter((record) =>
    record.checkInTime && record.checkOutTime && record.date
  );

  const statistics = {
    totalDays: filteredAttendance.length,
    presentDays: validAttendanceRecords.length,
    absentDays: filteredAttendance.length - validAttendanceRecords.length,
    totalHours: validAttendanceRecords.reduce((sum, record) => {
      try {
        let checkInDate: Date, checkOutDate: Date;

        if (record.checkInTime.includes('T')) {
          // Full ISO date string
          if (!isValid(parseISO(record.checkInTime))) return sum;
          checkInDate = parseISO(record.checkInTime);
        } else {
          // Time-only string, combine with date
          const baseDate = parseISO(record.date);
          const [hours, minutes, seconds] = record.checkInTime.split(':').map(Number);
          checkInDate = new Date(baseDate);
          checkInDate.setHours(hours, minutes, seconds || 0);
        }

        if (record.checkOutTime.includes('T')) {
          // Full ISO date string
          if (!isValid(parseISO(record.checkOutTime))) return sum;
          checkOutDate = parseISO(record.checkOutTime);
        } else {
          // Time-only string, combine with date
          const baseDate = parseISO(record.date);
          const [hours, minutes, seconds] = record.checkOutTime.split(':').map(Number);
          checkOutDate = new Date(baseDate);
          checkOutDate.setHours(hours, minutes, seconds || 0);
        }

        const hours = differenceInHours(checkOutDate, checkInDate);
        return sum + hours;
      } catch (error) {
        return sum;
      }
    }, 0),
    overtimeHours: filteredAttendance.reduce((sum, record) => sum + (record.overtimeHours || 0), 0),
    averageHours: validAttendanceRecords.length > 0
      ? validAttendanceRecords.reduce((sum, record) => {
        try {
          let checkInDate: Date, checkOutDate: Date;

          if (record.checkInTime.includes('T')) {
            // Full ISO date string
            if (!isValid(parseISO(record.checkInTime))) return sum;
            checkInDate = parseISO(record.checkInTime);
          } else {
            // Time-only string, combine with date
            const baseDate = parseISO(record.date);
            const [hours, minutes, seconds] = record.checkInTime.split(':').map(Number);
            checkInDate = new Date(baseDate);
            checkInDate.setHours(hours, minutes, seconds || 0);
          }

          if (record.checkOutTime.includes('T')) {
            // Full ISO date string
            if (!isValid(parseISO(record.checkOutTime))) return sum;
            checkOutDate = parseISO(record.checkOutTime);
          } else {
            // Time-only string, combine with date
            const baseDate = parseISO(record.date);
            const [hours, minutes, seconds] = record.checkOutTime.split(':').map(Number);
            checkOutDate = new Date(baseDate);
            checkOutDate.setHours(hours, minutes, seconds || 0);
          }

          const hours = differenceInHours(checkOutDate, checkInDate);
          return sum + hours;
        } catch (error) {
          return sum;
        }
      }, 0) / validAttendanceRecords.length
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
        const dateString = row.getValue('date') as string;
        if (!dateString || !isValid(parseISO(dateString))) {
          return <span className="text-red-500">Invalid date</span>;
        }
        const date = parseISO(dateString);
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
              // Handle both time-only strings (HH:mm:ss) and full ISO dates
              checkIn.includes('T') ?
                (isValid(parseISO(checkIn)) ? format(parseISO(checkIn), 'HH:mm') : <span className="text-red-500">Invalid time</span>) :
                checkIn // Display time-only strings as-is
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
              // Handle both time-only strings (HH:mm:ss) and full ISO dates
              checkOut.includes('T') ?
                (isValid(parseISO(checkOut)) ? format(parseISO(checkOut), 'HH:mm') : <span className="text-red-500">Invalid time</span>) :
                checkOut // Display time-only strings as-is
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
        const date = row.getValue('date') as string;

        if (!checkIn || !checkOut || !date) {
          return <span className="text-muted-foreground">N/A</span>;
        }

        try {
          let checkInDate: Date, checkOutDate: Date;

          if (checkIn.includes('T')) {
            // Full ISO date string
            if (!isValid(parseISO(checkIn))) return <span className="text-muted-foreground">N/A</span>;
            checkInDate = parseISO(checkIn);
          } else {
            // Time-only string, combine with date
            const baseDate = parseISO(date);
            const [hours, minutes, seconds] = checkIn.split(':').map(Number);
            checkInDate = new Date(baseDate);
            checkInDate.setHours(hours, minutes, seconds || 0);
          }

          if (checkOut.includes('T')) {
            // Full ISO date string
            if (!isValid(parseISO(checkOut))) return <span className="text-muted-foreground">N/A</span>;
            checkOutDate = parseISO(checkOut);
          } else {
            // Time-only string, combine with date
            const baseDate = parseISO(date);
            const [hours, minutes, seconds] = checkOut.split(':').map(Number);
            checkOutDate = new Date(baseDate);
            checkOutDate.setHours(hours, minutes, seconds || 0);
          }

          const hours = differenceInHours(checkOutDate, checkInDate);
          return <div className="font-medium">{hours.toFixed(1)}h</div>;
        } catch (error) {
          return <span className="text-muted-foreground">N/A</span>;
        }
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
          message={error instanceof Error ? error.message : 'Failed to load attendance records'}
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
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
        <p className="text-muted-foreground mt-2">
          View and track your daily attendance records
        </p>
      </div>

      {/* Month Filter */}
      <div className="mb-6 flex items-center gap-4">
        <label htmlFor="month-select" className="text-sm font-medium">
          Select Month:
        </label>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalDays}</div>
            <p className="text-xs text-muted-foreground">Days in {format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Days</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.presentDays}</div>
            <p className="text-xs text-muted-foreground">
              {attendanceRate.toFixed(1)}% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Average {statistics.averageHours.toFixed(1)}h per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{statistics.overtimeHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Extra hours worked</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredAttendance as PersonalAttendance[]}
            searchPlaceholder="Search attendance records..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
