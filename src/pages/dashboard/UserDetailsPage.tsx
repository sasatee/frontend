import React, { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLoading } from '@/contexts/LoadingContext';
import { authService } from '@/services/authService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { showErrorToast } from '@/lib/error-handler';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import the UserDetails type from types
import { UserDetails } from '@/types/user';

const defaultUserDetails: UserDetails = {
  id: '',
  email: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  roles: [],
  twoFactorEnabled: false,
  phoneNumberConfirmed: false,
  accessFailedCount: 0,
  appUserId: '',
};

export default function UserDetailsPage() {
  const { withLoading } = useLoading();
  const { toast } = useToast();

  const {
    data: userDetails,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['accountDetails'],
    queryFn: async () => {
      try {
        return await withLoading(authService.getAccountDetails(), 'Loading your profile...');
      } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    useErrorBoundary: false,
  });

  const handleRefetch = useCallback(async () => {
    try {
      await withLoading(refetch(), 'Refreshing profile...');
      toast({
        title: 'Profile Refreshed',
        description: 'Your profile information has been updated.',
      });
    } catch (error) {
      showErrorToast(error, 'refreshing profile');
    }
  }, [refetch, toast, withLoading]);

  // Process user details with proper type handling
  const processedUserDetails = useMemo(() => {
    if (!userDetails) return defaultUserDetails;

    if (Array.isArray(userDetails)) {
      return userDetails[0] || defaultUserDetails;
    }

    return userDetails as UserDetails;
  }, [userDetails]);

  // Get initials for avatar
  const initials = useMemo(() => {
    const { firstName, lastName } = processedUserDetails;
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  }, [processedUserDetails]);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-muted-foreground">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <h2 className="text-lg font-semibold text-destructive">Error Loading Profile</h2>
        <p className="mt-2 text-sm text-destructive/80">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <Button variant="outline" className="mt-4" onClick={handleRefetch} disabled={isRefetching}>
          <RefreshCw className={cn('mr-2 h-4 w-4', isRefetching && 'animate-spin')} />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Profile</h1>
        <Button variant="outline" onClick={handleRefetch} disabled={isRefetching}>
          <RefreshCw className={cn('mr-2 h-4 w-4', isRefetching && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center space-x-4 pb-2">
          <Avatar className="h-16 w-16">
            <AvatarImage src={processedUserDetails.avatar} alt={initials} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>
              {processedUserDetails.firstName} {processedUserDetails.lastName}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{processedUserDetails.email}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium">Roles</h3>
              <p className="text-sm text-muted-foreground">
                {processedUserDetails.roles && processedUserDetails.roles.length > 0
                  ? processedUserDetails.roles.join(', ')
                  : 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Phone Number</h3>
              <p className="text-sm text-muted-foreground">
                {processedUserDetails.phoneNumber || 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Phone Verified</h3>
              <p className="text-sm text-muted-foreground">
                {processedUserDetails.phoneNumberConfirmed ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Two Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                {processedUserDetails.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div>
              <h3 className="font-medium">User ID</h3>
              <p className="font-mono text-sm text-muted-foreground">
                {processedUserDetails.id || 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="font-medium">App User ID</h3>
              <p className="font-mono text-sm text-muted-foreground">
                {processedUserDetails.appUserId || 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
