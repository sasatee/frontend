import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { attendanceFormSchema } from '@/schemas/attendance';
import { AttendanceDTO } from '@/services/attendanceService';
import { format, parseISO } from 'date-fns';
import { useEmployees } from '@/hooks/useEmployees';
import { useAttendance } from '@/hooks/useAttendance';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';

type AttendanceFormValues = {
  employeeId: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  overtimeHours: number;
  status?: string;
};

interface AttendanceFormProps {
  attendance?: Attendance;
  onSuccess?: () => void;
}

export function AttendanceForm({ attendance, onSuccess }: AttendanceFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const { data: employees, isLoading: isEmployeesLoading } = useEmployees(true);
  const { createAttendance, updateAttendance } = useAttendance();

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceFormSchema),
    mode: 'onBlur',
    defaultValues: {
      employeeId: attendance?.employeeId || '',
      date: attendance?.date
        ? new Date(attendance.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      checkInTime: attendance?.checkInTime || '',
      checkOutTime: attendance?.checkOutTime || '',
      overtimeHours: attendance?.overtimeHours || 0,
      status: attendance?.status || 'Present',
    },
  });

  const onSubmit = async (data: AttendanceFormValues) => {
    try {
      setApiError(null);

      // Convert date to ISO string with timezone
      const dateWithTime = new Date(data.date);
      dateWithTime.setHours(0, 0, 0, 0);

      // Format the data to match API expectations
      const formattedData: AttendanceDTO = {
        employeeId: data.employeeId,
        date: dateWithTime.toISOString(),
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        overtimeHours: Number(data.overtimeHours),
        status: data.status,
      };

      console.log('Sending attendance data:', formattedData);

      if (attendance) {
        await updateAttendance.mutateAsync({
          id: attendance.id,
          data: formattedData,
        });
        toast({
          title: 'Success',
          description: 'Attendance record updated successfully',
        });
      } else {
        await createAttendance.mutateAsync(formattedData);
        toast({
          title: 'Success',
          description: 'Attendance record created successfully',
        });
      }

      onSuccess?.();
      navigate('/dashboard/attendance');
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred while saving the attendance record';
      setApiError(errorMessage);

      // Show toast for user feedback
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    }
  };

  return (
    <div>
      {apiError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee</FormLabel>
                <FormControl>
                  {isEmployeesLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees?.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.firstName} {employee.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} max={format(new Date(), 'yyyy-MM-dd')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="checkInTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Check In Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="checkOutTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Check Out Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="overtimeHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Overtime Hours</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="8"
                    step="0.5"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Present">Present</SelectItem>
                      <SelectItem value="Absent">Absent</SelectItem>
                      <SelectItem value="HalfDay">Half Day</SelectItem>
                      <SelectItem value="OnLeave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/attendance')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <LoadingSpinner />
              ) : attendance ? (
                'Update Attendance'
              ) : (
                'Create Attendance'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
