import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chart } from '@/components/ui/chart';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Separator } from '@/components/ui/separator';
import { useEmployees } from '@/hooks/useEmployees';
import { cn } from '@/lib/utils';
import { getAttendances } from '@/services/attendanceService';
import type { Attendance } from '@/types/attendance';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  BarChart3,
  Clock,
  DollarSign,
  PieChart,
  TrendingDown,
  UserCheck,
  Users
} from 'lucide-react';
import { useMemo } from 'react';

const DashboardPage = () => {
  // Fetch all required data
  const { data: employeesData = [], isLoading: isLoadingEmployees } = useEmployees(false);

  // Ensure employees is always an array
  const employees = Array.isArray(employeesData) ? employeesData : [];

  const { data: attendances = [], isLoading: isLoadingAttendance } = useQuery<Attendance[]>({
    queryKey: ['attendances'],
    queryFn: () => getAttendances(),
  });

  // Calculate employee statistics
  const employeeStats = useMemo(() => {
    if (!employees.length) return null;

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const activeEmployees = employees.filter((e) => !e.dateOfLeaving);
    const newHiresThisMonth = employees.filter((e) => {
      const joinDate = new Date(e.dateOfJoining);
      return joinDate.getMonth() === thisMonth && joinDate.getFullYear() === thisYear;
    });
    const newHiresLastMonth = employees.filter((e) => {
      const joinDate = new Date(e.dateOfJoining);
      return joinDate.getMonth() === lastMonth && joinDate.getFullYear() === lastMonthYear;
    });

    const departmentCounts = employees.reduce(
      (acc, emp) => {
        const deptName = emp.department?.name || 'Unassigned';
        acc[deptName] = (acc[deptName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalEmployees: employees.length,
      activeEmployees: activeEmployees.length,
      newHiresThisMonth: newHiresThisMonth.length,
      newHiresChange: newHiresThisMonth.length - newHiresLastMonth.length,
      departmentDistribution: departmentCounts,
    };
  }, [employees]);

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    if (!attendances.length || !employees.length) return null;

    const today = new Date().toISOString().split('T')[0];
    const todayAttendances = attendances.filter((a) => a.date.startsWith(today));

    const calculateHours = (checkIn: string, checkOut: string) => {
      const start = new Date(checkIn).getTime();
      const end = new Date(checkOut).getTime();
      return (end - start) / (1000 * 60 * 60); // Convert to hours
    };

    const presentToday = todayAttendances.length;
    const attendanceRate = (presentToday / employees.length) * 100;
    const totalHours = todayAttendances.reduce(
      (acc, curr) => acc + calculateHours(curr.checkInTime, curr.checkOutTime),
      0
    );
    const averageHours = totalHours / (presentToday || 1);

    return {
      presentToday,
      attendanceRate,
      averageHours,
    };
  }, [attendances, employees]);

  // Calculate payroll statistics
  const payrollStats = useMemo(() => {
    if (!employees.length) return null;

    const totalPayroll = employees.reduce((acc, emp) => acc + emp.salary, 0);
    const averageSalary = totalPayroll / employees.length;
    const totalAllowances = employees.reduce((acc, emp) => acc + emp.allowances, 0);
    const totalDeductions = employees.reduce((acc, emp) => acc + emp.deductions, 0);

    return {
      totalPayroll,
      averageSalary,
      totalAllowances,
      totalDeductions,
    };
  }, [employees]);

  if (isLoadingEmployees || isLoadingAttendance) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-8 px-6 py-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your HR management dashboard. Here's an overview of your organization.
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-none bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md dark:from-blue-950/30 dark:to-indigo-950/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{employeeStats?.totalEmployees || 0}</div>
            <div className="mt-2 flex items-center text-xs">
              {employeeStats?.newHiresChange !== undefined && (
                <div
                  className={cn(
                    'flex items-center rounded-full px-2 py-0.5 font-medium',
                    employeeStats.newHiresChange >= 0
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  )}
                >
                  {employeeStats.newHiresChange >= 0 ? (
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {employeeStats.newHiresChange >= 0 ? '+' : ''}
                  {employeeStats.newHiresChange} from last month
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none bg-gradient-to-br from-green-50 to-emerald-50 shadow-md dark:from-green-950/30 dark:to-emerald-950/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <div className="rounded-full bg-green-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-300">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{attendanceStats?.presentToday || 0}</div>
            <div className="mt-2">
              <Badge
                variant={
                  (attendanceStats?.attendanceRate || 0) >= 80
                    ? 'success'
                    : (attendanceStats?.attendanceRate || 0) >= 60
                      ? 'warning'
                      : 'destructive'
                }
              >
                {attendanceStats?.attendanceRate?.toFixed(1) || '0.0'}% attendance
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none bg-gradient-to-br from-amber-50 to-yellow-50 shadow-md dark:from-amber-950/30 dark:to-yellow-950/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Hours</CardTitle>
            <div className="rounded-full bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {attendanceStats?.averageHours?.toFixed(1) || '0.0'} hrs
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Per employee today</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none bg-gradient-to-br from-purple-50 to-fuchsia-50 shadow-md dark:from-purple-950/30 dark:to-fuchsia-950/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <div className="rounded-full bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              Rs{(payrollStats?.totalPayroll || 0).toLocaleString()}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Avg: Rs{(payrollStats?.averageSalary || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold">Department Distribution</CardTitle>
              <CardDescription>Employee count by department</CardDescription>
            </div>
            <PieChart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <Chart
                type="pie"
                data={{
                  labels: Object.keys(employeeStats?.departmentDistribution || {}),
                  datasets: [
                    {
                      data: Object.values(employeeStats?.departmentDistribution || {}),
                      backgroundColor: [
                        'rgba(99, 102, 241, 0.7)', // Indigo
                        'rgba(59, 130, 246, 0.7)', // Blue
                        'rgba(16, 185, 129, 0.7)', // Green
                        'rgba(245, 158, 11, 0.7)', // Yellow
                        'rgba(239, 68, 68, 0.7)', // Red
                        'rgba(168, 85, 247, 0.7)', // Purple
                      ],
                      borderColor: [
                        'rgb(99, 102, 241)',
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(239, 68, 68)',
                        'rgb(168, 85, 247)',
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                          size: 11,
                        },
                      },
                    },
                  },
                  animation: {
                    duration: 2000,
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold">Payroll Distribution</CardTitle>
              <CardDescription>Breakdown of payroll components</CardDescription>
            </div>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <Chart
                type="bar"
                data={{
                  labels: ['Allowances', 'Deductions', 'Net Pay'],
                  datasets: [
                    {
                      label: 'Amount',
                      data: [
                        payrollStats?.totalAllowances || 0,
                        payrollStats?.totalDeductions || 0,
                        payrollStats?.totalPayroll || 0,
                      ],
                      backgroundColor: [
                        'rgba(16, 185, 129, 0.7)', // Green
                        'rgba(239, 68, 68, 0.7)', // Red
                        'rgba(59, 130, 246, 0.7)', // Blue
                      ],
                      borderColor: ['rgb(16, 185, 129)', 'rgb(239, 68, 68)', 'rgb(59, 130, 246)'],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        // @ts-ignore
                        label: function (context) {
                          let label = context.dataset.label || '';
                          if (label) {
                            label += ': ';
                          }
                          if (context.parsed.y !== null) {
                            label += 'Rs' + context.parsed.y.toLocaleString();
                          }
                          return label;
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                      ticks: {
                        // @ts-ignore
                        callback: function (value) {
                          return 'Rs' + value.toLocaleString();
                        },
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                  animation: {
                    duration: 2000,
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
