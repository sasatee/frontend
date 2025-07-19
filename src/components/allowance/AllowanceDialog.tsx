import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useEmployees } from '@/hooks/useEmployees';
import { createAllowance, updateAllowance } from '@/services/allowanceService';
import { Allowance, CreateAllowanceDto, UpdateAllowanceDto } from '@/types/allowance';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const allowanceSchema = z.object({
  typeName: z.string().min(1, 'Type is required'),
  description: z.string().min(1, 'Description is required'),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  remarks: z.string(),
  employeeId: z.string().min(1, 'Employee ID is required'),
  amount: z.number().min(0, 'Amount must be greater than or equal to 0'),
});

interface AllowanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allowance?: Allowance | null;
  employeeId?: string;
}

export function AllowanceDialog({
  open,
  onOpenChange,
  allowance,
  employeeId,
}: AllowanceDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: employees } = useEmployees();

  const form = useForm<z.infer<typeof allowanceSchema>>({
    resolver: zodResolver(allowanceSchema),
    defaultValues: {
      typeName: '',
      description: '',
      effectiveDate: new Date().toISOString().split('T')[0],
      remarks: '',
      employeeId: employeeId || '',
      amount: 0,
    },
  });

  useEffect(() => {
    if (allowance) {
      form.reset({
        typeName: allowance.typeName,
        description: allowance.description,
        effectiveDate: new Date(allowance.effectiveDate).toISOString().split('T')[0],
        remarks: allowance.remarks,
        employeeId: allowance.employeeId,
        amount: allowance.amount,
      });
    }
  }, [allowance, form]);

  const createMutation = useMutation({
    mutationFn: (data: CreateAllowanceDto) => createAllowance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowances'] });
      if (employeeId) {
        queryClient.invalidateQueries({ queryKey: ['allowances', employeeId] });
      }
      toast({
        title: 'Success',
        description: 'Allowance created successfully',
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create allowance',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateAllowanceDto) => updateAllowance(allowance?.id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowances'] });
      if (employeeId) {
        queryClient.invalidateQueries({ queryKey: ['allowances', employeeId] });
      }
      toast({
        title: 'Success',
        description: 'Allowance updated successfully',
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update allowance',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof allowanceSchema>) => {
    try {
      // Prepare the submission data
      const submissionData = {
        typeName: data.typeName,
        description: data.description,
        effectiveDate: data.effectiveDate,
        remarks: data.remarks,
        employeeId: employeeId || data.employeeId,
        amount: data.amount,
      };

      if (allowance) {
        await updateMutation.mutateAsync(submissionData);
      } else {
        await createMutation.mutateAsync(submissionData);
      }

      // Refresh the data
      await queryClient.invalidateQueries({ queryKey: ['allowances'] });
      if (employeeId) {
        await queryClient.invalidateQueries({ queryKey: ['allowances', employeeId] });
      }
      await queryClient.refetchQueries({ queryKey: ['allowances'] });
    } catch (error) {
      console.error('Failed to submit allowance:', error);
    }
  };

  // Handle dialog close to reset form
  const handleDialogOpenChange = (newOpenState: boolean) => {
    if (!newOpenState) {
      // Reset form when dialog closes
      form.reset({
        typeName: '',
        description: '',
        effectiveDate: new Date().toISOString().split('T')[0],
        remarks: '',
        employeeId: employeeId || '',
        amount: 0,
      });
    }
    onOpenChange(newOpenState);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{allowance ? 'Edit Allowance' : 'Create Allowance'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="typeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter allowance type (e.g., Bonus, Transportation, etc.)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="effectiveDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Effective Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!employeeId && (
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <FormControl>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{allowance ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
