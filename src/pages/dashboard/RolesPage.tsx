import { useState } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { getRoleColumns } from '@/components/role/columns';
import RoleDialog from '@/components/role/RoleDialog';
import AssignRoleDialog from '@/components/role/AssignRoleDialog';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { useToast } from '@/components/ui/use-toast';
import { Role } from '@/services/roleService';
import { useRoles } from '@/hooks/useRoles';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { RoleFormValues } from '@/schemas/role';

export default function RolesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [pageSize] = useState(10);
  const { toast } = useToast();

  const { data: roles, isLoading, createRole, updateRole, deleteRole, assignRole } = useRoles();

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = async (values: RoleFormValues) => {
    try {
      await createRole.mutateAsync(values.roleName);
      setIsCreateDialogOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const handleEditSubmit = async (values: RoleFormValues) => {
    if (!selectedRole) return;
    try {
      await updateRole.mutateAsync({
        id: selectedRole.id,
        roleName: values.roleName,
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRole) return;
    try {
      await deleteRole.mutateAsync(selectedRole.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete role',
      });
    }
  };

  const handleAssignSubmit = async (values: { userId: string; roleId: string }) => {
    try {
      await assignRole.mutateAsync(values);
      setIsAssignDialogOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const columns = getRoleColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Roles Management</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative">
            {isLoading && <LoadingOverlay />}
            <DataTable
              columns={columns}
              data={roles || []}
              isLoading={isLoading}
              searchPlaceholder="Search roles..."
              title="Roles"
              subtitle="Manage user roles and permissions"
              pagination={true}
              initialPageSize={pageSize}
              emptyMessage="No roles found."
              actions={
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAssignDialogOpen(true)}
                    className="flex items-center"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign Role
                  </Button>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Role
                  </Button>
                </div>
              }
            />
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">Total roles: {roles?.length || 0}</p>
        </CardFooter>
      </Card>

      {/* Create Role Dialog */}
      <RoleDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSubmit}
      />

      {/* Edit Role Dialog */}
      {selectedRole && (
        <RoleDialog
          role={selectedRole}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* Assign Role Dialog */}
      <AssignRoleDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        onSubmit={handleAssignSubmit}
        roles={roles || []}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Role"
        description={`Are you sure you want to delete the role "${selectedRole?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
