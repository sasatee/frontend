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
import { useCurrentEmployeeId } from '@/hooks/useCurrentEmployeeId';
import { useMyLeaveBalance } from '@/hooks/useLeaveBalance';
import { cn } from '@/lib/utils';
import { createLeaveRequestSchema } from '@/schemas/leaveRequest';
import { CreateLeaveRequestDto, LeaveRequest } from '@/types/leaveRequest';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { LeaveBalanceDisplay } from './LeaveBalanceDisplay';

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
  const { data: currentEmployeeId, isLoading: isLoadingEmployeeId } = useCurrentEmployeeId();
  const currentYear = new Date().getFullYear();

  // Get leave balance data for validation
  const { data: leaveBalance } = useMyLeaveBalance(
    typeof currentEmployeeId === 'string' ? currentEmployeeId : '',
    currentYear
  );

  // Process leave balance data for validation
  const balanceData = useMemo(() => {
    if (!leaveBalance) return [];

    if (Array.isArray(leaveBalance)) {
      return leaveBalance;
    } else if (leaveBalance && typeof leaveBalance === 'object' && 'balances' in leaveBalance && Array.isArray((leaveBalance as any).balances)) {
      return (leaveBalance as any).balances;
    } else if (leaveBalance && typeof leaveBalance === 'object' && 'leaveTypeId' in leaveBalance) {
      return [leaveBalance];
    }

    return [];
  }, [leaveBalance]);

  // Create dynamic schema with real leave balance data
  const dynamicSchema = useMemo(() => {
    return createLeaveRequestSchema(balanceData);
  }, [balanceData]);

  const form = useForm<CreateLeaveRequestDto>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      startDate: '',
      endDate: '',
      leaveTypeId: '',
      requestComments: '',
      requestingEmployeeId: '',
    },
  });

  // Watch form values for leave balance display
  const watchedValues = form.watch();
  const { leaveTypeId, startDate, endDate } = watchedValues;

  useEffect(() => {
    if (leaveRequest) {
      // For editing, don't include requestingEmployeeId
      form.reset({
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        leaveTypeId: leaveRequest.leaveTypeId,
        requestComments: leaveRequest.requestComments || '',
        requestingEmployeeId: leaveRequest.requestingEmployeeId,
      });
    } else {
      // For new requests, include requestingEmployeeId when available
      form.reset({
        startDate: '',
        endDate: '',
        leaveTypeId: '',
        requestComments: '',
        requestingEmployeeId: '',
      });
    }
  }, [leaveRequest, form]);

  // Set the requestingEmployeeId only for new requests when it becomes available
  useEffect(() => {
    if (!leaveRequest && currentEmployeeId && typeof currentEmployeeId === 'string') {
      form.setValue('requestingEmployeeId', currentEmployeeId);
    }
  }, [currentEmployeeId, form, leaveRequest]);

  const handleSubmit = async (values: CreateLeaveRequestDto) => {
    try {
      // For new requests, ensure requestingEmployeeId is included
      const submitValues = leaveRequest
        ? values // For editing, use the values as is
        : {
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {leaveRequest ? 'Edit Leave Request' : 'Create Leave Request'}
          </DialogTitle>
          <DialogDescription>
            {leaveRequest
              ? 'Make changes to your leave request here.'
              : 'Fill in the details for your leave request.'}
          </DialogDescription>
        </DialogHeader>

        {/* Show leave balance information */}
        {!leaveRequest && (
          <LeaveBalanceDisplay
            selectedLeaveTypeId={leaveTypeId}
            startDate={startDate}
            endDate={endDate}
          />
        )}

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
                        <SelectValue placeholder="Select leave type" />
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
                          variant={'outline'}
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
                          variant={'outline'}
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
              name="requestComments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide a reason for your leave request..."
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
              <Button type="submit" disabled={isLoadingEmployeeId}>
                {leaveRequest ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
