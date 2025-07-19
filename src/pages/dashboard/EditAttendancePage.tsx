import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAttendance } from '@/hooks/useAttendance';
import { useEmployees } from '@/hooks/useEmployees';
import { getAttendanceById } from '@/services/attendanceService';
import { Attendance } from '@/types/attendance';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditAttendancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const { updateAttendance } = useAttendance();

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!attendance || !id) return;

    try {
      await updateAttendance.mutateAsync({
        id,
        data: {
          employeeId: attendance.employeeId,
          date: new Date(attendance.date).toISOString(),
          checkInTime: attendance.checkInTime,
          checkOutTime: attendance.checkOutTime,
          overtimeHours: attendance.overtimeHours,

        },
      });

      toast({
        title: 'Success',
        description: 'Attendance record updated successfully',
      });

      // Navigate back to the attendance list instead of details page
      navigate('/dashboard/attendance');
    } catch (error) {
      console.error('Update error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update attendance record',
      });
    }
  };

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

  const selectedEmployee = employees?.find((emp) => emp.id === attendance.employeeId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="employeeId">Employee</Label>
            <Select
              value={attendance.employeeId}
              onValueChange={(value) => setAttendance({ ...attendance, employeeId: value })}
            >
              <SelectTrigger>
                <SelectValue>
                  {selectedEmployee
                    ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
                    : 'Select Employee'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {employees?.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              type="date"
              id="date"
              value={format(new Date(attendance.date), 'yyyy-MM-dd')}
              onChange={(e) =>
                setAttendance({ ...attendance, date: new Date(e.target.value).toISOString() })
              }
            />
          </div>
          <div>
            <Label htmlFor="checkInTime">Check In Time</Label>
            <Input
              type="time"
              id="checkInTime"
              value={attendance.checkInTime}
              onChange={(e) => setAttendance({ ...attendance, checkInTime: e.target.value })}
              step="60"
            />
          </div>
          <div>
            <Label htmlFor="checkOutTime">Check Out Time</Label>
            <Input
              type="time"
              id="checkOutTime"
              value={attendance.checkOutTime}
              onChange={(e) => setAttendance({ ...attendance, checkOutTime: e.target.value })}
              step="60"
            />
          </div>
          <div>
            <Label htmlFor="overtimeHours">Overtime Hours</Label>
            <Input
              type="number"
              id="overtimeHours"
              value={attendance.overtimeHours}
              onChange={(e) =>
                setAttendance({ ...attendance, overtimeHours: parseInt(e.target.value) })
              }
              min="0"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => navigate(`/dashboard/attendance/${id}`)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
