import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Calendar, Clock, Download, Filter, User, CalendarDays } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { AttendanceStatusBadge } from '@/components/attendance/AttendanceStatusBadge';
import { Attendance } from '@/types/attendance';
import { useAttendance } from '@/hooks/useAttendance';
import { format, isToday, parseISO } from 'date-fns';
import { calculateWorkHours, formatWorkHours, cn } from '@/lib/utils';
import { useEmployees } from '@/hooks/useEmployees';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'today'>('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState<Attendance | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const { data: employees } = useEmployees();
  const { data: attendances, isLoading: loading, error, deleteAttendance } = useAttendance();

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

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
  const enhancedAttendances = attendances?.map((attendance) => {
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
  });

  const filteredAttendances = enhancedAttendances?.filter((attendance: Attendance) => {
    // Filter by view mode (all or today)
    if (viewMode === 'today' && !isToday(parseISO(attendance.date))) {
      return false;
    }

    // Filter by employee name or ID
    if (searchTerm) {
      const employeeName = attendance.employee
        ? `${attendance.employee.firstName} ${attendance.employee.lastName}`.toLowerCase()
        : '';

      if (
        !attendance.employeeId.toString().includes(searchTerm) &&
        !employeeName.includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      const attendanceDate = new Date(attendance.date);
      if (dateFrom && attendanceDate < new Date(dateFrom)) {
        return false;
      }
      if (dateTo && attendanceDate > new Date(dateTo)) {
        return false;
      }
    }

    return true;
  });

  const handleExportCSV = () => {
    if (!filteredAttendances?.length) return;

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
      ...filteredAttendances.map((attendance: Attendance) => {
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

  const columns = [
    {
      id: 'employee',
      header: 'Employee',
      cell: ({ row }: { row: { original: Attendance } }) => {
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
            <div className="font-medium">{employeeName}</div>
          </div>
        );
      },
    },
    {
      id: 'date',
      header: 'Date',
      cell: ({ row }: { row: { original: Attendance } }) => {
        const attendance = row.original;
        const date = new Date(attendance.date);
        return (
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span>{format(date, 'MMM dd, yyyy')}</span>
            {isToday(date) && <Badge variant="outline">Today</Badge>}
          </div>
        );
      },
    },
    {
      id: 'checkInTime',
      header: 'Check In',
      cell: ({ row }: { row: { original: Attendance } }) => {
        const attendance = row.original;
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{attendance.checkInTime || 'N/A'}</span>
          </div>
        );
      },
    },
    {
      id: 'checkOutTime',
      header: 'Check Out',
      cell: ({ row }: { row: { original: Attendance } }) => {
        const attendance = row.original;
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{attendance.checkOutTime || 'N/A'}</span>
          </div>
        );
      },
    },
    {
      id: 'workHours',
      header: 'Work Hours',
      cell: ({ row }: { row: { original: Attendance } }) => {
        const attendance = row.original;
        const workHours = calculateWorkHours(attendance.checkInTime, attendance.checkOutTime);
        return (
          <div className="flex items-center gap-2">
            <span>{formatWorkHours(workHours)}</span>
          </div>
        );
      },
    },
    {
      id: 'overtimeHours',
      header: 'Overtime',
      cell: ({ row }: { row: { original: Attendance } }) => {
        const attendance = row.original;
        return (
          <div className="flex items-center gap-2">
            <span>{attendance.overtimeHours || 0} hrs</span>
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: Attendance } }) => {
        const attendance = row.original;
        return (
          <AttendanceStatusBadge status={attendance.status} checkInTime={attendance.checkInTime} />
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: { row: { original: Attendance } }) => {
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-more-horizontal"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => navigate(`/dashboard/attendance/${row.original.id}`)}
                >
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setAttendanceToDelete(row.original);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-center">Loading Attendance Records</CardTitle>
            <CardDescription className="text-center">
              Please wait while we fetch the data
            </CardDescription>
          </CardHeader>
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
              disabled={!filteredAttendances?.length}
            >
              <Download className="mr-1 h-3 w-3" />
              Export
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="w-full md:w-64">
            <Label htmlFor="searchTerm">Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="searchTerm"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="w-full md:w-auto">
            <Label htmlFor="dateFrom">Date From</Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="w-full md:w-auto">
            <Label htmlFor="dateTo">Date To</Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('all')}
          >
            <CalendarDays className="mr-1 h-4 w-4" />
            All Records
          </Button>
          <Button
            variant={viewMode === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('today')}
          >
            <Calendar className="mr-1 h-4 w-4" />
            Today
          </Button>

          <Tooltip content="Clear all filters">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => {
                setSearchTerm('');
                setDateFrom('');
                setDateTo('');
                setViewMode('all');
              }}
            >
              <Filter className="h-4 w-4" />
              <span className="sr-only">Clear filters</span>
            </Button>
          </Tooltip>
        </div>
      </div>

      {filteredAttendances?.length === 0 ? (
        <Card className="flex h-[300px] flex-col items-center justify-center">
          <User className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No attendance records found</h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm || dateFrom || dateTo || viewMode === 'today'
              ? 'Try adjusting your filters'
              : 'Create your first attendance record to get started'}
          </p>
          {!searchTerm && !dateFrom && !dateTo && (
            <Button className="mt-4" onClick={() => navigate('/dashboard/attendance/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          )}
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={
                filteredAttendances?.slice((currentPage - 1) * pageSize, currentPage * pageSize) ||
                []
              }
              searchable={true}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              pagination={true}
              pageSize={pageSize}
              currentPage={currentPage}
              totalItems={filteredAttendances?.length || 0}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
              isLoading={loading}
              density="normal"
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {filteredAttendances?.length} of {enhancedAttendances?.length} records
            </p>
          </CardFooter>
        </Card>
      )}

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
