import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { JobTitle } from '@/types/jobTitle';
import { jobTitleSchema, JobTitleFormValues } from '@/schemas/jobTitle';

interface JobTitleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle?: JobTitle | null;
  onSubmit: (data: JobTitleFormValues) => void;
  isLoading?: boolean;
}

export function JobTitleDialog({
  open,
  onOpenChange,
  jobTitle,
  onSubmit,
  isLoading = false,
}: JobTitleDialogProps) {
  const form = useForm<JobTitleFormValues>({
    resolver: zodResolver(jobTitleSchema),
    defaultValues: {
      title: '',
    },
  });

  useEffect(() => {
    if (jobTitle) {
      form.reset({
        title: jobTitle.title,
      });
    } else {
      form.reset({
        title: '',
      });
    }
  }, [jobTitle, form]);

  const handleSubmit = (data: JobTitleFormValues) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{jobTitle ? 'Edit Job Title' : 'Add Job Title'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter job title"
                      {...field}
                      disabled={isLoading}
                      maxLength={100}
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
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : jobTitle ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
