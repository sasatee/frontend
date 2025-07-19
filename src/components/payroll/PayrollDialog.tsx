import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEmployees } from '@/hooks/useEmployees';
import { useCategoryGroups } from '@/hooks/useCategoryGroups';
import { payrollSchema, PayrollFormData } from '@/schemas/payroll';
import { PayrollResponse } from '@/services/payrollService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PayrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PayrollFormData) => Promise<void>;
  initialData?: PayrollResponse;
}

export function PayrollDialog({ open, onOpenChange, onSubmit, initialData }: PayrollDialogProps) {
  const { data: employees, isLoading: isLoadingEmployees } = useEmployees();
  const { data: categoryGroups, isLoading: isLoadingCategoryGroups } = useCategoryGroups();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  const form = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      employeeId: initialData?.employeeId || '',
      categoryGroupId: initialData?.categoryGroupId || '',
      yearOfService: initialData?.yearOfService || 0,
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && initialData) {
      form.reset({
        employeeId: initialData.employeeId,
        categoryGroupId: initialData.categoryGroupId,
        yearOfService: initialData.yearOfService,
      });
      setSelectedEmployee(initialData.employeeId);
    } else if (!open) {
      form.reset();
      setSelectedEmployee('');
    }
  }, [open, initialData, form]);

  // Watch employee selection to update category group
  const watchEmployeeId = form.watch('employeeId');
  useEffect(() => {
    if (watchEmployeeId && employees) {
      const employee = employees.find((e) => e.id === watchEmployeeId);
      if (employee && employee.categoryGroupId) {
        form.setValue('categoryGroupId', employee.categoryGroupId);
        form.setValue('yearOfService', Number(employee.yearsOfService) || 0);
      }
    }
  }, [watchEmployeeId, employees, form]);

  const handleSubmit = async (data: PayrollFormData) => {
    // Validate if employee's category group matches
    if (employees && categoryGroups) {
      const employee = employees.find((e) => e.id === data.employeeId);
      if (employee && employee.categoryGroupId !== data.categoryGroupId) {
        form.setError('categoryGroupId', {
          type: 'manual',
          message: "Selected category group does not match employee's category group",
        });
        return;
      }

      // Convert both values to numbers for comparison
      const employeeYears = Number(employee?.yearsOfService) || 0;
      const inputYears = Number(data.yearOfService) || 0;

      if (employee && employeeYears !== inputYears) {
        form.setError('yearOfService', {
          type: 'manual',
          message: "Years of service does not match employee's record",
        });
        return;
      }
    }

    await onSubmit(data);
    onOpenChange(false);
    form.reset();
  };

  if (isLoadingEmployees || isLoadingCategoryGroups) {
    return <LoadingSpinner />;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Payroll' : 'Create Payroll'}</DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update payroll information for the selected employee.'
              : 'Create a new payroll record for an employee based on their category group and years of service.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedEmployee(value);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees
                        ?.filter((employee) => employee.id && employee.id !== '')
                        .map((employee) => (
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
              name="categoryGroupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Group</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedEmployee}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryGroups
                        ?.filter((group) => group.id && group.id !== '')
                        .map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
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
              name="yearOfService"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Service</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value}
                      disabled={!selectedEmployee}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{initialData ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
