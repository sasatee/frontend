import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leaveAllocationPayloadSchema } from '../../schemas/leaveAllocation';
import { LeaveAllocationPayload } from '../../types/leaveAllocation';
import { useEmployees } from '../../hooks/useEmployees';
import { useLeaveTypes } from '../../hooks/useLeaveTypes';
import { useAuth } from '../../hooks/useAuth';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Props {
  initialValues?: Partial<LeaveAllocationPayload>;
  onSubmit: (values: LeaveAllocationPayload) => Promise<void>;
  onCancel: () => void;
}

const LeaveAllocationForm: React.FC<Props> = ({ initialValues, onSubmit, onCancel }) => {
  const { data: employees } = useEmployees();
  const { data: leaveTypes } = useLeaveTypes();
  const { user } = useAuth();

  const form = useForm<LeaveAllocationPayload>({
    resolver: zodResolver(leaveAllocationPayloadSchema),
    defaultValues: {
      employeeId: '',
      leaveTypeId: '',
      numberOfDays: 0,
      period: new Date().getFullYear(),
      ...initialValues,
    },
  });

  const selectedLeaveType = form.watch('leaveTypeId');

  useEffect(() => {
    if (selectedLeaveType && leaveTypes) {
      const leaveType = leaveTypes.find((lt) => lt.id === selectedLeaveType);
      if (leaveType?.defaultDays) {
        form.setValue('numberOfDays', leaveType.defaultDays);
      }
    }
  }, [selectedLeaveType, leaveTypes, form]);

  const handleSubmit = async (values: LeaveAllocationPayload) => {
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      // Error will be handled by the parent component
      throw error;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {employees?.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="leaveTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Leave Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {leaveTypes?.map((leaveType) => (
                    <SelectItem key={leaveType.id} value={leaveType.id}>
                      {leaveType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Period</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numberOfDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Days</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <input type="hidden" {...form.register('appUserId')} value={user?.id} />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LeaveAllocationForm;
