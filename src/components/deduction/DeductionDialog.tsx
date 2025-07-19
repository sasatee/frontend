import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
import { Deduction, CreateDeductionDto, UpdateDeductionDto } from '@/types/deduction';
import { useEmployees } from '@/hooks/useEmployees';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const deductionSchema = z.object({
  typeName: z.string().min(1, 'Type name is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0, 'Amount must be greater than or equal to 0'),
  employeeId: z.string().min(1, 'Employee is required'),
  remarks: z.string().default(''),
});

type DeductionFormData = z.infer<typeof deductionSchema>;

interface DeductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateDeductionDto | UpdateDeductionDto) => void;
  initialData?: Deduction;
  mode: 'create' | 'edit';
}

export function DeductionDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: DeductionDialogProps) {
  const { data: employees, isLoading: isLoadingEmployees } = useEmployees();

  const form = useForm<DeductionFormData>({
    resolver: zodResolver(deductionSchema),
    defaultValues: {
      typeName: initialData?.typeName || '',
      description: initialData?.description || '',
      amount: initialData?.amount || 0,
      employeeId: initialData?.employeeId || '',
      remarks: initialData?.remarks || '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        initialData
          ? {
              typeName: initialData.typeName,
              description: initialData.description,
              amount: initialData.amount,
              employeeId: initialData.employeeId,
              remarks: initialData.remarks || '',
            }
          : {
              typeName: '',
              description: '',
              amount: 0,
              employeeId: '',
              remarks: '',
            }
      );
    }
  }, [open, initialData, form]);

  const handleSubmit = (data: DeductionFormData) => {
    // Format data to match API structure (only send required fields for POST/PUT)
    const formattedData = {
      typeName: data.typeName.trim(),
      amount: Number(data.amount),
      employeeId: data.employeeId.trim(),
      remarks: (data.remarks || '').trim(),
    };

    onSubmit(formattedData);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Deduction' : 'Edit Deduction'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new deduction record here.'
              : 'Edit the deduction record details.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="typeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingEmployees ? (
                          <div className="flex items-center justify-center p-4">
                            <LoadingSpinner className="h-4 w-4" />
                          </div>
                        ) : (
                          employees?.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.firstName} {employee.lastName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{mode === 'create' ? 'Create' : 'Update'} Deduction</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
