import { useEffect, useState } from 'react';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Employee } from '@/types/employee';
import { useDepartments } from '@/hooks/useDepartments';
import { useJobTitles } from '@/hooks/useJobTitles';
import { useCategoryGroups } from '@/hooks/useCategoryGroups';
import { employeeSchema } from '@/schemas/employee';
import { useToast } from '@/components/ui/use-toast';
import { ErrorAlert } from '@/components/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Textarea } from '@/components/ui/textarea';
import { employeeService, CreateEmployeeDto, UpdateEmployeeDto } from '@/services/employeeService';
import { useQueryClient } from '@tanstack/react-query';
import type { EmployeeFormValues } from '@/types/employee';

// Add import for date picker
import { format } from 'date-fns';

interface EmployeeDialogProps {
  employee?: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: CreateEmployeeDto | UpdateEmployeeDto) => void;
}

export default function EmployeeDialog({
  open,
  onOpenChange,
  employee,
  onSubmit,
}: EmployeeDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state

  // Get departments and job titles
  const departmentsQuery = useDepartments();
  const jobTitlesQuery = useJobTitles();
  const categoryGroupsQuery = useCategoryGroups();

  const isDepartmentsLoading = departmentsQuery.isLoading;
  const isJobTitlesLoading = jobTitlesQuery.isLoading;
  const isCategoryGroupsLoading = categoryGroupsQuery.isLoading;

  // Extract the actual data arrays, handling different possible response formats
  const departmentsList =
    departmentsQuery.data?.departments ||
    departmentsQuery.data?.result ||
    (Array.isArray(departmentsQuery.data) ? departmentsQuery.data : []);

  const jobTitlesList =
    jobTitlesQuery.data?.jobTitles ||
    jobTitlesQuery.data?.result ||
    (Array.isArray(jobTitlesQuery.data) ? jobTitlesQuery.data : []);

  const categoryGroupsList =
    categoryGroupsQuery.data?.categoryGroups ||
    categoryGroupsQuery.data?.result ||
    (Array.isArray(categoryGroupsQuery.data) ? categoryGroupsQuery.data : []);

  // Get form
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: employee?.firstName || '',
      lastName: employee?.lastName || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      address: employee?.address || '',
      departmentId: employee?.departmentId || '',
      jobTitleId: employee?.jobTitleId || '',
      categoryGroupId: employee?.categoryGroupId || '',
      nic: employee?.nic || '',
      dateOfJoining: employee?.dateOfJoining ? new Date(employee.dateOfJoining) : undefined,
      gender: (employee?.gender as 'Male' | 'Female' | 'Other') || 'Male',
      yearsOfService: employee?.yearsOfService || 0,
      postalCode: employee?.postalCode || '',
      city: employee?.city || '',
      country: employee?.country || '',
    },
  });

  useEffect(() => {
    if (employee) {
      // Reset form with employee data
      form.reset({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phone: employee.phone || '',
        address: employee.address || '',
        departmentId: employee.departmentId || '',
        jobTitleId: employee.jobTitleId || '',
        categoryGroupId: employee.categoryGroupId || '',
        nic: employee.nic || '',
        dateOfJoining: employee.dateOfJoining ? new Date(employee.dateOfJoining) : undefined,
        gender: (employee.gender as 'Male' | 'Female' | 'Other') || 'Male',
        yearsOfService: employee.yearsOfService || 0,
        postalCode: employee.postalCode || '',
        city: employee.city || '',
        country: employee.country || '',
      });
    } else if (open) {
      // Reset form when opening in create mode
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        departmentId: '',
        jobTitleId: '',
        categoryGroupId: '',
        nic: '',
        dateOfJoining: new Date(), // Default to current date
        gender: 'Male' as const,
        yearsOfService: 0,
        postalCode: '',
        city: '',
        country: '',
      });
    }
  }, [employee, form, open]);

  // Validate department and job title IDs exist
  const validateDepartmentAndJobTitle = (values: EmployeeFormValues): boolean => {
    // Check if the selected department exists
    const departmentExists = departmentsList.some((dept) => dept.id === values.departmentId);
    if (!departmentExists && values.departmentId) {
      setError(`Invalid Department ID. Please select a valid department.`);
      return false;
    }

    // Check if the selected job title exists
    const jobTitleExists = jobTitlesList.some((job) => job.id === values.jobTitleId);
    if (!jobTitleExists && values.jobTitleId) {
      setError(`Invalid Job Title ID. Please select a valid job title.`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (values: EmployeeFormValues) => {
    setIsLoading(true);
    setIsSubmitting(true);
    setError(null);

    try {
      if (!validateDepartmentAndJobTitle(values)) {
        setIsLoading(false);
        setIsSubmitting(false);
        return;
      }

      if (employee) {
        // Update existing employee
        const updateData: UpdateEmployeeDto = {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          address: values.address,
          yearOfService: values.yearsOfService || 0,
          jobTitle: jobTitlesList.find((job) => job.id === values.jobTitleId)?.title || '',
          postalCode: values.postalCode || '',
          city: values.city || '',
          country: values.country || '',
        };

        if (onSubmit) {
          onSubmit(updateData);
        } else {
          await employeeService.updateEmployee(employee.id, updateData);
          toast({
            title: 'Employee Updated',
            description: 'Employee has been updated successfully',
          });

          // Invalidate and refetch queries
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['employees'] }),
            queryClient.invalidateQueries({ queryKey: ['paginatedEmployees'] }),
            queryClient.invalidateQueries({ queryKey: ['all-employees'] }),
          ]);

          onOpenChange(false);
        }
      } else {
        // Create new employee
        const createData: CreateEmployeeDto = {
          ...values,
          jobTitle: jobTitlesList.find((job) => job.id === values.jobTitleId)?.title || '',
        };

        if (onSubmit) {
          onSubmit(createData);
        } else {
          await employeeService.createEmployee(createData);
          toast({
            title: 'Employee Created',
            description: 'New employee has been created successfully',
          });

          // Invalidate and refetch queries
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['employees'] }),
            queryClient.invalidateQueries({ queryKey: ['paginatedEmployees'] }),
            queryClient.invalidateQueries({ queryKey: ['all-employees'] }),
          ]);

          onOpenChange(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
          <DialogDescription>
            {employee
              ? 'Edit the employee details below. Only First Name, Last Name, Phone, Address, Years of Service, and Job Title can be updated.'
              : 'Fill out the form below to create a new employee.'}
          </DialogDescription>
        </DialogHeader>

        {error && <ErrorAlert message={error} className="mb-4" />}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* First Name */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      First Name{' '}
                      {employee && <span className="ml-1 text-green-600">(Editable)</span>}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Last Name{' '}
                      {employee && <span className="ml-1 text-green-600">(Editable)</span>}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email{' '}
                      {employee && (
                        <span className="ml-1 text-muted-foreground">(Not editable)</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@example.com"
                        {...field}
                        disabled={!!employee} // Disable email editing for existing employees
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone {employee && <span className="ml-1 text-green-600">(Editable)</span>}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NIC */}
              <FormField
                control={form.control}
                name="nic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      NIC{' '}
                      {employee && (
                        <span className="ml-1 text-muted-foreground">(Not editable)</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="National ID" {...field} disabled={!!employee} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gender */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Gender{' '}
                      {employee && (
                        <span className="ml-1 text-muted-foreground">(Not editable)</span>
                      )}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={!!employee}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Department */}
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Department{' '}
                      {employee && (
                        <span className="ml-1 text-muted-foreground">(Not editable)</span>
                      )}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={!!employee}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isDepartmentsLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : departmentsList.length === 0 ? (
                          <SelectItem value="no-departments" disabled>
                            No departments available
                          </SelectItem>
                        ) : (
                          departmentsList
                            .filter((department) => department.id && department.id !== '')
                            .map((department) => (
                              <SelectItem key={department.id} value={department.id}>
                                {department.departmentName || 'Unnamed Department'}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Job Title */}
              <FormField
                control={form.control}
                name="jobTitleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Job Title{' '}
                      {employee && <span className="ml-1 text-green-600">(Editable)</span>}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job title" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isJobTitlesLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : jobTitlesList.length === 0 ? (
                          <SelectItem value="no-job-titles" disabled>
                            No job titles available
                          </SelectItem>
                        ) : (
                          jobTitlesList
                            .filter((jobTitle) => jobTitle.id && jobTitle.id !== '')
                            .map((jobTitle) => (
                              <SelectItem key={jobTitle.id} value={jobTitle.id}>
                                {jobTitle.title}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Years of Service */}
              <FormField
                control={form.control}
                name="yearsOfService"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Years of Service{' '}
                      {employee && <span className="ml-1 text-green-600">(Editable)</span>}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category Group */}
              <FormField
                control={form.control}
                name="categoryGroupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Category Group{' '}
                      {employee && (
                        <span className="ml-1 text-muted-foreground">(Not editable)</span>
                      )}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={!!employee}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isCategoryGroupsLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : categoryGroupsList.length === 0 ? (
                          <SelectItem value="no-category-groups-available" disabled>
                            No category groups available
                          </SelectItem>
                        ) : (
                          categoryGroupsList
                            .filter((group) => group.id && group.id !== '')
                            .map((group) => (
                              <SelectItem key={group.id} value={group.id}>
                                {group.name}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date of Joining */}
              <FormField
                control={form.control}
                name="dateOfJoining"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Date of Joining{' '}
                      {employee && (
                        <span className="ml-1 text-muted-foreground">(Not editable)</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : null;
                          field.onChange(date);
                        }}
                        disabled={!!employee}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Address {employee && <span className="ml-1 text-green-600">(Editable)</span>}
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="123 Main St, City, Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Postal Code */}
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Postal Code{' '}
                      {employee && <span className="ml-1 text-green-600">(Editable)</span>}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="11134" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* City */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      City {employee && <span className="ml-1 text-green-600">(Editable)</span>}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Port Louis" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Country */}
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Country {employee && <span className="ml-1 text-green-600">(Editable)</span>}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Mauritius" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading || isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isSubmitting}>
                {isLoading ? <LoadingSpinner className="mr-2" /> : null}
                {employee ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
