import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { useEmployees } from '@/hooks/useEmployees';
import { getAttendanceById } from '@/services/attendanceService';
import { Attendance } from '@/types/attendance';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function AttendanceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: employees, isLoading: employeesLoading } = useEmployees();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        if (!id) return;
        const data = await getAttendanceById(id);
        setAttendance(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch attendance details',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [id, toast]);

  if (loading || employeesLoading) {
    return <LoadingSpinner />;
  }

  if (!attendance) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p>Attendance record not found</p>
            <Button onClick={() => navigate('/dashboard/attendance')} className="mt-4">
              Back to Attendance
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const employee = employees?.find((emp) => emp.id === attendance.employeeId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Employee</h3>
            <p className="text-gray-600">
              {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee'}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Date</h3>
            <p className="text-gray-600">{format(new Date(attendance.date), 'PPP')}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Check In Time</h3>
            <p className="text-gray-600">{attendance.checkInTime}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Check Out Time</h3>
            <p className="text-gray-600">{attendance.checkOutTime}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Overtime Hours</h3>
            <p className="text-gray-600">{attendance.overtimeHours}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/dashboard/attendance')} variant="outline">
              Back to Attendance
            </Button>
            <Button onClick={() => navigate(`/dashboard/attendance/${attendance.id}/edit`)}>
              Edit Record
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
