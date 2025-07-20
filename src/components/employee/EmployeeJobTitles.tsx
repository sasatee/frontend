// @ts-ignore
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getJobTitleByEmployee } from '@/services/jobTitleService';
import { JobTitle } from '@/types/jobTitle';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';

interface EmployeeJobTitlesProps {
  employeeId: string;
}

export default function EmployeeJobTitles({ employeeId }: EmployeeJobTitlesProps) {
  const {
    data: jobTitle,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['jobTitle', 'employee', employeeId],
    queryFn: () => getJobTitleByEmployee(employeeId),
    enabled: !!employeeId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job Title</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <LoadingSpinner className="h-6 w-6" />
        </CardContent>
      </Card>
    );
  }

  // Always render the card, even if there is no job title
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Title</CardTitle>
      </CardHeader>
      <CardContent>
        {jobTitle ? (
          <div className="space-y-4">
            <div className="border-b pb-4 last:border-0 last:pb-0">
              <h3 className="font-medium">{jobTitle.title}</h3>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No job title assigned</p>
        )}

        {isError && (
          <Alert className="mt-4 border-amber-200 bg-amber-50/50 text-amber-800 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-500">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Job Title</AlertTitle>
            <AlertDescription className="text-xs">
              {error instanceof Error ? error.message : 'Failed to load job title information.'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
