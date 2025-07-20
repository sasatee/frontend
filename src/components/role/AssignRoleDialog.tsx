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
import { userService, UserDetails } from '@/services/userService';
import { assignRoleSchema, AssignRoleFormValues } from '@/schemas/role';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, CheckCircle } from 'lucide-react';

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
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
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
      setSelectedUserId('');
      onOpenChange(false);
    } catch (err: any) {
      // Handle specific "UserAlreadyInRole" error
      if (err.message?.includes('UserAlreadyInRole') || err.message?.includes('already in role')) {
        setError('This user already has the selected role. Please choose a different role or user.');
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Format user display name (prioritize full name, fallback to email)
  const getUserDisplayName = (user: UserDetails) => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.email;
  };

  // Get selected user's current roles
  const selectedUser = users.find(user => user.id === selectedUserId);
  const selectedUserRoles = selectedUser?.roles || [];

  // Filter out roles that the selected user already has
  const availableRoles = roles.filter((role: Role) => 
    !selectedUserRoles.some((userRole: string) => 
      userRole.toUpperCase() === role.name.toUpperCase()
    )
  );

  // Handle user selection
  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
    form.setValue('userId', userId);
    form.setValue('roleId', ''); // Reset role selection when user changes
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Role to User</DialogTitle>
          <DialogDescription>
            Select a user and a role to assign. This will grant the selected permissions to the user.
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
                    onValueChange={handleUserChange}
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
                              <div className="flex flex-col">
                                <span>{getUserDisplayName(user)}</span>
                                {user.roles && user.roles.length > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    Current roles: {user.roles.join(', ')}
                                  </span>
                                )}
                              </div>
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

            {/* Show selected user's current roles */}
            {selectedUser && selectedUserRoles.length > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Current roles:</strong>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedUserRoles.map((role: string) => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role to Assign</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles.length > 0 ? (
                        availableRoles
                          .filter((role) => role.id && role.id !== '')
                          .map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="no-available-roles" disabled>
                          No available roles to assign
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Show info about available roles */}
            {selectedUser && availableRoles.length === 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This user already has all available roles. No additional roles can be assigned.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isLoading || availableRoles.length === 0 || !selectedUserId}
              >
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
