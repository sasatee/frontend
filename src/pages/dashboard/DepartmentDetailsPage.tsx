import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { departmentService } from '@/services/departmentService';

export default function DepartmentDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: department,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['department', id],
    queryFn: () => departmentService.getDepartmentById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorAlert message="Failed to load department details" />;
  }

  if (!department) {
    return <ErrorAlert message="Department not found" />;
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Department Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Name</h3>
            <p className="text-gray-600">{department.departmentName}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium">Head of Department</h3>
            <p className="text-gray-600">{department.headOfDepartment || 'Not assigned'}</p>
          </div>
          {/* Description field is not in the API response */}
        </CardContent>
      </Card>
    </div>
  );
}
