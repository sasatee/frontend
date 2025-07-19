import React from 'react';
import { useEmployees } from '../../hooks/useEmployees';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/common/DataTable';
import { getEmployeeColumns } from '@/components/employees/columns';
import { useToast } from '@/components/ui/use-toast';
import { Employee } from '@/types/employee';
import { RefreshCw } from 'lucide-react';

export default function EnhancedTableExample() {
  const { toast } = useToast();
  const { data: employees = [], isLoading, refetch } = useEmployees();

  const handleRefresh = async () => {
    await refetch();
    toast({
      title: 'Refreshed',
      description: 'Employee data has been refreshed',
    });
  };

  const handleRowAction = (action: 'edit' | 'delete' | 'view', employee: Employee) => {
    const actionMap = {
      edit: 'Editing',
      delete: 'Deleting',
      view: 'Viewing',
    };

    toast({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Employee`,
      description: `${actionMap[action]} ${employee.firstName} ${employee.lastName}`,
      variant: action === 'delete' ? 'destructive' : 'default',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enhanced Table Example</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={getEmployeeColumns({
            onEdit: (employee) => handleRowAction('edit', employee),
            onDelete: (employee) => handleRowAction('delete', employee),
            onView: (employee) => handleRowAction('view', employee),
          })}
          data={employees}
          isLoading={isLoading}
          searchPlaceholder="Search employees..."
          actions={
            <button onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          }
        />
      </CardContent>
    </Card>
  );
}
