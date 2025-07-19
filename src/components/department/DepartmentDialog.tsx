import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Department } from '@/types/department';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ErrorAlert } from '@/components/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { departmentSchema, DepartmentFormValues } from '@/schemas/department';

interface DepartmentDialogProps {
  department?: Department;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DepartmentFormValues) => void;
  isSubmitting?: boolean;
}

export default function DepartmentDialog({
  department,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: DepartmentDialogProps) {
  const [error, setError] = useState<string | null>(null);

  // Create form
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      departmentName: department?.departmentName || '',
      headOfDepartment: department?.headOfDepartment || '',
    },
  });

  // Update form values when department changes
  useEffect(() => {
    if (department) {
      form.reset({
        departmentName: department.departmentName || '',
        headOfDepartment: department.headOfDepartment || '',
      });
    } else {
      form.reset({
        departmentName: '',
        headOfDepartment: '',
      });
    }
  }, [department, form]);

  // Handle form submission
  const handleSubmit = async (values: DepartmentFormValues) => {
    setError(null);
    try {
      onSubmit(values);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the department');
    }
  };

  // Handle dialog open state change
  const handleOpenChange = (newOpenState: boolean) => {
    // If closing the dialog, reset the form
    if (!newOpenState) {
      form.reset({
        departmentName: '',
        headOfDepartment: '',
      });
      setError(null);
    }
    onOpenChange(newOpenState);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{department ? 'Edit Department' : 'Create Department'}</DialogTitle>
          <DialogDescription>
            {department
              ? 'Update department information'
              : 'Add a new department to the organization'}
          </DialogDescription>
        </DialogHeader>

        {error && <ErrorAlert message={error} />}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="departmentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter department name"
                      {...field}
                      maxLength={100}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="headOfDepartment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Head of Department</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter head of department"
                      {...field}
                      maxLength={100}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    {department ? 'Updating...' : 'Creating...'}
                  </>
                ) : department ? (
                  'Update Department'
                ) : (
                  'Create Department'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
