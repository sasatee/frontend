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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Role, RoleAssignment } from '@/services/roleService';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { userService, User } from '@/services/userService';
import { assignRoleSchema, AssignRoleFormValues } from '@/schemas/role';

interface AssignRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: RoleAssignment) => Promise<void>;
  roles: Role[];
}

export default function AssignRoleDialog({
  open,
  onOpenChange,
  onSubmit,
  roles,
}: AssignRoleDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const { toast } = useToast();

  // Initialize form
  const form = useForm<AssignRoleFormValues>({
    resolver: zodResolver(assignRoleSchema),
    defaultValues: {
      userId: '',
      roleId: '',
    },
  });

  // Fetch users when dialog opens
  useEffect(() => {
    const fetchUsers = async () => {
      if (!open) return;

      setIsLoadingUsers(true);
      try {
        // Use the userService to fetch all users
        const fetchedUsers = await userService.getAllUsers();
        console.log('Fetched users in AssignRoleDialog:', fetchedUsers);
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load users. Please try again.',
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [open, toast]);

  const handleSubmit = async (values: AssignRoleFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create role assignment payload matching API structure
      const roleAssignment: RoleAssignment = {
        userId: values.userId,
        roleId: values.roleId,
      };

      await onSubmit(roleAssignment);
      form.reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Format user display name (prioritize full name, fallback to email)
  const getUserDisplayName = (user: User) => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.email;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Role to User</DialogTitle>
          <DialogDescription>
            Select a user and a role to assign. This will grant the selected permissions to the
            user.
          </DialogDescription>
        </DialogHeader>

        {error && <ErrorAlert message={error} className="mb-4" />}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingUsers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={isLoadingUsers ? 'Loading users...' : 'Select a user'}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingUsers ? (
                        <SelectItem value="loading" disabled>
                          Loading users...
                        </SelectItem>
                      ) : users.length > 0 ? (
                        users
                          .filter((user) => user.id && user.id !== '')
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {getUserDisplayName(user)}
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="no-users" disabled>
                          No users available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles
                        .filter((role) => role.id && role.id !== '')
                        .map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <LoadingSpinner className="mr-2" /> : null}
                {isLoading ? 'Assigning...' : 'Assign Role'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
