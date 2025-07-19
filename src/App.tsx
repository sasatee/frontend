import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ui/theme-provider';
import router from '@/routes';
import { queryClient } from '@/lib/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="project-management-theme">
        <AccessibilityProvider>
          <QueryClientProvider client={queryClient}>
            <LoadingProvider>
              <AuthProvider>
                <RouterProvider router={router} />
                <Toaster />
                <LoadingOverlay />
              </AuthProvider>
            </LoadingProvider>
          </QueryClientProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
