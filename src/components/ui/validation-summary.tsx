import React, { useMemo, useEffect } from 'react';
import { useFormState } from 'react-hook-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ValidationSummaryProps {
  control: any;
  title?: string;
  showSuccessMessage?: boolean;
  successMessage?: string;
  className?: string;
  onValid?: () => void;
  excludeFields?: string[];
}

export function ValidationSummary({
  control,
  title = 'Please fix the following errors:',
  showSuccessMessage = false,
  successMessage = 'All fields are valid',
  className,
  onValid,
  excludeFields = [],
}: ValidationSummaryProps) {
  const { errors, isValid } = useFormState({ control });

  // Memoize error flattening function
  const flattenErrors = useMemo(() => {
    const flatten = (
      obj: Record<string, any>,
      path: string = ''
    ): { path: string; message: string }[] => {
      return Object.entries(obj).reduce(
        (acc: { path: string; message: string }[], [key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;

          // Skip excluded fields
          if (excludeFields.includes(currentPath)) {
            return acc;
          }

          if (value && typeof value === 'object' && !value.message) {
            // Recursively flatten nested objects
            return [...acc, ...flatten(value, currentPath)];
          }

          if (value && value.message) {
            return [...acc, { path: currentPath, message: value.message as string }];
          }

          return acc;
        },
        []
      );
    };

    return flatten(errors);
  }, [errors, excludeFields]);

  // Call onValid callback when form becomes valid
  useEffect(() => {
    if (isValid && onValid) {
      onValid();
    }
  }, [isValid, onValid]);

  // Don't render anything if no errors and success message not requested
  if (flattenErrors.length === 0 && !showSuccessMessage) {
    return null;
  }

  return (
    <Alert
      variant={flattenErrors.length > 0 ? 'destructive' : 'default'}
      className={cn('mt-4', className)}
    >
      <AlertTitle>{flattenErrors.length > 0 ? title : successMessage}</AlertTitle>
      {flattenErrors.length > 0 && (
        <AlertDescription>
          <ul className="ml-4 list-disc">
            {flattenErrors.map(({ path, message }, index) => (
              <li key={`${path}-${index}`} className="mt-2">
                <span className="font-medium">{path}:</span> {message}
              </li>
            ))}
          </ul>
        </AlertDescription>
      )}
    </Alert>
  );
}
