import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentEmployeeId } from '@/hooks/useCurrentEmployeeId';
import { cn } from '@/lib/utils';
import { CreateLeaveRequestDto, LeaveRequest } from '@/types/leaveRequest';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface LeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateLeaveRequestDto) => Promise<void>;
  leaveRequest?: LeaveRequest;
  leaveTypes: Array<{ id: string; name: string }>;
}

export default function LeaveRequestDialog({
  open,
  onOpenChange,
  onSubmit,
  leaveRequest,
  leaveTypes,
}: LeaveRequestDialogProps) {
  const { user } = useAuth();
  const { data: currentEmployeeId, isLoading: isLoadingEmployeeId } = useCurrentEmployeeId();

  const form = useForm<CreateLeaveRequestDto>({
    defaultValues: {
      startDate: '',
      endDate: '',
      leaveTypeId: '',
      requestComments: '',
    },
  });

  useEffect(() => {
    if (leaveRequest) {
      form.reset({
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        leaveTypeId: leaveRequest.leaveTypeId,
        requestComments: leaveRequest.requestComments,
      });
    } else {
      form.reset({
        startDate: '',
        endDate: '',
        leaveTypeId: '',
        requestComments: '',
      });
    }
  }, [leaveRequest, form]);

  // Set the requestingEmployeeId when it becomes available
  useEffect(() => {
    if (currentEmployeeId && typeof currentEmployeeId === 'string') {
      form.setValue('requestingEmployeeId', currentEmployeeId);
    }
  }, [currentEmployeeId, form]);

  const handleSubmit = async (values: CreateLeaveRequestDto) => {
    try {
      // Ensure requestingEmployeeId is included
      const submitValues = {
        ...values,
        requestingEmployeeId: currentEmployeeId && typeof currentEmployeeId === 'string' ? currentEmployeeId : '',
      };
      await onSubmit(submitValues);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error will be handled by the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{leaveRequest ? 'Edit Leave Request' : 'New Leave Request'}</DialogTitle>
          <DialogDescription>
            {leaveRequest
              ? 'Edit your leave request details below'
              : 'Create a new leave request by filling out the form below'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="leaveTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a leave type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
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
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? date.toISOString() : '')}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? date.toISOString() : '')}
                        disabled={(date) => date < new Date(form.getValues('startDate'))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requestComments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional comments here..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />



            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{leaveRequest ? 'Update Request' : 'Submit Request'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
