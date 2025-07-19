import React from 'react';
import { LoadingSpinner, PulsingDots } from './ui/loading-spinner';
import { useLoading } from '@/contexts/LoadingContext';
import { cn } from '@/lib/utils';

export function LoadingOverlay() {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in">
      <div className="flex flex-col items-center gap-3 rounded-lg bg-background p-6 shadow-lg">
        <LoadingSpinner size="lg" />
        {loadingMessage && (
          <p className="text-center text-sm font-medium text-muted-foreground">{loadingMessage}</p>
        )}
      </div>
    </div>
  );
}
