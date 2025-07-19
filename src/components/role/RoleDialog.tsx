import { useState } from 'react';
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
import { Role } from '@/services/roleService';
import { useToast } from '@/components/ui/use-toast';
import { ErrorAlert } from '@/components/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { roleSchema, RoleFormValues } from '@/schemas/role';

interface RoleDialogProps {
  role?: Role;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: RoleFormValues) => Promise<void>;
  title?: string;
  description?: string;
}

export default function RoleDialog({
  role,
  open,
  onOpenChange,
  onSubmit,
  title = role ? 'Edit Role' : 'Create Role',
  description = role ? 'Update role information' : 'Add a new role to the system',
}: RoleDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      roleName: role?.name || '',
    },
  });

  const handleSubmit = async (values: RoleFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      await onSubmit(values);
      form.reset();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {error && <ErrorAlert message={error} className="mb-4" />}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="roleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter role name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <LoadingSpinner className="mr-2" /> : null}
                {isLoading
                  ? role
                    ? 'Updating...'
                    : 'Creating...'
                  : role
                    ? 'Update Role'
                    : 'Create Role'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
