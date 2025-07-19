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
import { useToast } from '@/components/ui/use-toast';
import { useEmployees } from '@/hooks/useEmployees';
import { createAttendance } from '@/services/attendanceService';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as z from 'zod';

const formSchema = z
  .object({
    employeeId: z.string().min(1, 'Employee is required'),
    date: z.string().min(1, 'Date is required'),
    checkInTime: z.string().min(1, 'Check-in time is required'),
    checkOutTime: z.string().min(1, 'Check-out time is required'),
    overtimeHours: z.number().min(0, 'Overtime hours must be non-negative'),
  })
  .refine(
    (data) => {
      // Convert times to comparable values
      const checkIn = data.checkInTime.split(':').map(Number);
      const checkOut = data.checkOutTime.split(':').map(Number);

      // Convert to minutes for comparison
      const checkInMinutes = checkIn[0] * 60 + checkIn[1];
      const checkOutMinutes = checkOut[0] * 60 + checkOut[1];

      // Allow check-out time to be less than check-in time (for next day)
      // or greater than check-in time (same day)
      return true;
    },
    {
      message: 'Check-out time must be after check-in time',
      path: ['checkOutTime'],
    }
  );

type FormData = z.infer<typeof formSchema>;

export default function NewAttendancePage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch employees data
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: '',
      date: new Date().toISOString().split('T')[0],
      checkInTime: '',
      checkOutTime: '',
      overtimeHours: 0,
    },
  });

  // Create attendance mutation
  const createAttendanceMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await createAttendance(data);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Attendance record created successfully',
      });

      // Invalidate and refetch attendance queries
      queryClient.invalidateQueries({ queryKey: ['attendances'] });

      // Navigate back to attendance list
      navigate('/dashboard/attendance');
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create attendance record',
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      await createAttendanceMutation.mutateAsync(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">New Attendance Record</h2>
        <p className="text-muted-foreground">Create a new attendance record</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-4">
          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee</FormLabel>
                <FormControl>
                  <Select
                    disabled={isLoading || isLoadingEmployees}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Input
                    type="date"
                    {...field}
                    disabled={isLoading}
                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                  />
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
                <FormLabel>Check-in Time</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    disabled={isLoading}
                    step="60" // Prevent seconds input
                  />
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
                <FormLabel>Check-out Time</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    disabled={isLoading}
                    step="60" // Prevent seconds input
                  />
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
                    step="0.5"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading || isLoadingEmployees || createAttendanceMutation.isPending}
            >
              {isLoading || createAttendanceMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Record'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/attendance')}
              disabled={isLoading || createAttendanceMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
