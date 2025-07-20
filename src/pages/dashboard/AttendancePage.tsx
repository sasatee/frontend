import ConfirmationDialog from '@/components/ConfirmationDialog';
import { ErrorAlert } from '@/components/ErrorAlert';
import { AttendanceStatusBadge } from '@/components/attendance/AttendanceStatusBadge';
import { DataTable } from '@/components/common/DataTable';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTableRowActions } from '@/components/ui/data-table-row-actions';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useAttendance } from '@/hooks/useAttendance';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/hooks/useAuth';
import { formatWorkHours } from '@/lib/utils';
import { Attendance } from '@/types/attendance';
import { ColumnDef } from '@tanstack/react-table';
import { format, isToday, parseISO } from 'date-fns';
import { Clock, Download, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function AttendancePage() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState<Attendance | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const { data: employees } = useEmployees();
  const { data: attendances, isLoading: loading, error, deleteAttendance } = useAttendance();
  const { isAdmin, getUserRoles } = useAuth();

  const handleDelete = async (row: { original: Attendance }) => {
    try {
      await deleteAttendance.mutateAsync(row.original.id);
      toast({
        title: 'Success',
        description: 'Attendance record deleted successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete attendance record',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setAttendanceToDelete(null);
    }
  };

  // Enhance attendances with employee data
  const enhancedAttendances = useMemo(() => {
    return attendances?.map((attendance) => {
      if (attendance.employee) return attendance;

      // Find matching employee and enhance the attendance
      const matchingEmployee = employees?.find((emp) => emp.id === attendance.employeeId);
      if (matchingEmployee) {
        return {
          ...attendance,
          employee: {
            id: matchingEmployee.id,
            firstName: matchingEmployee.firstName,
            lastName: matchingEmployee.lastName,
            email: matchingEmployee.email,
          },
        };
      }
      return attendance;
    }) || [];
  }, [attendances, employees]);

  const handleExportCSV = () => {
    if (!enhancedAttendances?.length) return;

    const headers = [
      'Employee Name',
      'Employee ID',
      'Date',
      'Check In',
      'Check Out',
      'Overtime Hours',
    ];
    const csvContent = [
      headers.join(','),
      ...enhancedAttendances.map((attendance: Attendance) => {
        const employeeName = attendance.employee
          ? `${attendance.employee.firstName} ${attendance.employee.lastName}`
          : 'Unknown';

        return [
          employeeName,
          attendance.employeeId,
          format(new Date(attendance.date), 'yyyy-MM-dd'),
          attendance.checkInTime,
          attendance.checkOutTime,
          attendance.overtimeHours,
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnDef<Attendance>[] = useMemo(() => [
    {
      accessorKey: 'employee',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
      cell: ({ row }) => {
        const attendance = row.original;
        const employeeName = attendance.employee
          ? `${attendance.employee.firstName} ${attendance.employee.lastName}`
          : 'Unknown';
        const initials = attendance.employee
          ? `${attendance.employee.firstName[0]}${attendance.employee.lastName[0]}`
          : 'UN';

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{employeeName}</div>
              <div className="text-sm text-muted-foreground">ID: {attendance.employeeId}</div>
            </div>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'date',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => {
        const attendance = row.original;
        const date = new Date(attendance.date);
        return (
          <div className="flex flex-col">
            <div className="font-medium">{format(date, 'MMM dd, yyyy')}</div>
            <div className="text-sm text-muted-foreground">{format(date, 'EEEE')}</div>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'checkInTime',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Check In" />,
      cell: ({ row }) => {
        const attendance = row.original;
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono">{attendance.checkInTime || 'N/A'}</span>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'checkOutTime',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Check Out" />,
      cell: ({ row }) => {
        const attendance = row.original;
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono">{attendance.checkOutTime || 'N/A'}</span>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'overtimeHours',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Overtime" />,
      cell: ({ row }) => {
        const attendance = row.original;
        const overtime = attendance.overtimeHours || 0;
        return (
          <Badge variant={overtime > 0 ? 'default' : 'secondary'}>
            {formatWorkHours(overtime)}
          </Badge>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    
    {
      id: 'actions',
      cell: ({ row }) => {
        const userRoles = getUserRoles();
        const canEdit = userRoles.includes('ADMIN') || userRoles.includes('EMPLOYEE');
        const canDelete = userRoles.includes('ADMIN');
        
        return (
          <DataTableRowActions
            row={row}
            onEdit={canEdit ? () => navigate(`/dashboard/attendance/${row.original.id}/edit`) : undefined}
            onDelete={canDelete ? () => {
              setAttendanceToDelete(row.original);
              setIsDeleteDialogOpen(true);
            } : undefined}
            onView={() => navigate(`/dashboard/attendance/${row.original.id}`)}
          />
        );
      },
    },
  ], [navigate, getUserRoles]);

  // Filterable columns for status
  const filterableColumns = useMemo(() => [
    {
      id: 'status',
      title: 'Status',
      options: [
        { label: 'Present', value: 'Present' },
        { label: 'Absent', value: 'Absent' },
        { label: 'Late', value: 'Late' },
        { label: 'Half Day', value: 'Half Day' },
        { label: 'Leave', value: 'Leave' },
      ],
    },
  ], []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Attendance Records</h1>
          <p className="text-muted-foreground">
            Track and manage employee attendance and working hours.
          </p>
        </div>
        <Card>
          <CardContent className="flex justify-center pb-6 pt-4">
            <LoadingSpinner className="h-12 w-12" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <ErrorAlert message="Failed to load attendance records" />;
  }

  const todayAttendanceCount =
    enhancedAttendances?.filter((a: Attendance) => isToday(parseISO(a.date))).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Attendance Records</h1>
        <p className="text-muted-foreground">
          Track and manage employee attendance and working hours.
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enhancedAttendances?.length || 0}</div>
            <p className="text-xs text-muted-foreground">All attendance records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAttendanceCount}</div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button size="sm" onClick={() => navigate('/dashboard/attendance/new')}>
              <Plus className="mr-1 h-3 w-3" />
              New Record
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              disabled={!enhancedAttendances?.length}
            >
              <Download className="mr-1 h-3 w-3" />
              Export
            </Button>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={enhancedAttendances}
        isLoading={loading}
        pagination
        initialPageSize={10}
        searchPlaceholder="Search by employee name or ID..."
        title="Attendance Records"
        subtitle="View and manage employee attendance"
        filterableColumns={filterableColumns}
        actions={
          <div className="flex gap-2">
            <Button onClick={() => navigate('/dashboard/attendance/new')}>
              <Plus className="mr-2 h-4 w-4" />
              New Record
            </Button>
            <Button variant="outline" onClick={handleExportCSV} disabled={!enhancedAttendances?.length}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
        initialSortColumn="date"
        initialSortDirection="desc"
        emptyMessage="No attendance records found. Create your first record to get started."
      />

      {attendanceToDelete && (
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Delete Attendance Record"
          description="Are you sure you want to delete this attendance record? This action cannot be undone."
          onConfirm={() => handleDelete({ original: attendanceToDelete })}
        />
      )}
    </div>
  );
}
