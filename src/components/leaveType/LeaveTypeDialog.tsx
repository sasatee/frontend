import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LeaveType } from '@/types/leaveType';
import { leaveTypeSchema } from '@/schemas/leaveType';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// This interface matches exactly with the API structure
interface LeaveTypeFormValues {
  name: string;
  defaultDays: number;
}

interface LeaveTypeDialogProps {
  leaveType?: LeaveType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: LeaveTypeFormValues) => void;
  isSubmitting?: boolean;
}

export default function LeaveTypeDialog({
  leaveType,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: LeaveTypeDialogProps) {
  const form = useForm<LeaveTypeFormValues>({
    resolver: zodResolver(leaveTypeSchema),
    defaultValues: {
      name: '',
      defaultDays: 0,
    },
  });

  // Reset form when dialog opens/closes or leaveType changes
  useEffect(() => {
    if (open) {
      if (leaveType) {
        form.reset({
          name: leaveType.name || '',
          defaultDays: leaveType.defaultDays || 0,
        });
      } else {
        form.reset({
          name: '',
          defaultDays: 0,
        });
      }
    }
  }, [open, leaveType, form]);

  const handleSubmit = (values: LeaveTypeFormValues) => {
    try {
      console.log('Submitting leave type form:', values);
      onSubmit?.(values);
    } catch (error) {
      console.error('Error submitting leave type form:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{leaveType ? 'Edit Leave Type' : 'Create Leave Type'}</DialogTitle>
          <DialogDescription>
            {leaveType ? 'Edit the details of this leave type.' : 'Create a new leave type.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter leave type name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Days</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      min={0}
                      max={365}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
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
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoadingSpinner size="sm" /> : leaveType ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
