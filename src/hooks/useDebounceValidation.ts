import { useState, useCallback, useEffect, useRef } from 'react';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { useDebounce } from './useDebounce';

interface ValidationOptions {
  delay?: number;
  validateOnMount?: boolean;
  showLoading?: boolean;
}

/**
 * Hook for debounced field validation with API calls
 * @param form - React Hook Form's form instance
 * @param field - Field name to validate
 * @param validationFn - Async validation function
 * @param options - Validation options
 */
export function useDebounceValidation<T extends FieldValues>(
  form: UseFormReturn<T>,
  field: Path<T>,
  validationFn: (value: any) => Promise<string | null>,
  options: ValidationOptions = {}
) {
  const { delay = 500, validateOnMount = false, showLoading = true } = options;
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const isMounted = useRef(true);

  // Get the current field value
  const fieldValue = form.watch(field);

  // Debounce the field value to avoid excessive validation calls
  const debouncedValue = useDebounce(fieldValue, delay);

  // Memoize validation function to prevent unnecessary re-renders
  const validate = useCallback(
    async (value: any) => {
      if (!isMounted.current || !value) {
        setValidationError(null);
        return;
      }

      try {
        if (showLoading) setIsValidating(true);

        // Call the validation function
        const error = await validationFn(value);

        // Only update state if component is still mounted
        if (isMounted.current) {
          setValidationError(error);

          // Set the form error if there's a validation error
          if (error) {
            form.setError(field, { type: 'validate', message: error });
          } else {
            form.clearErrors(field);
          }
        }
      } catch (error) {
        if (isMounted.current) {
          console.error('Validation error:', error);
          setValidationError('An error occurred during validation');
          form.setError(field, {
            type: 'validate',
            message: 'An error occurred during validation',
          });
        }
      } finally {
        if (isMounted.current && showLoading) {
          setIsValidating(false);
        }
      }
    },
    [field, form, showLoading, validationFn]
  );

  // Trigger validation when debounced value changes
  useEffect(() => {
    // Skip initial validation if not requested
    if (!validateOnMount && fieldValue === form.formState.defaultValues?.[field]) {
      return;
    }
    validate(debouncedValue);
  }, [debouncedValue, validate, validateOnMount, field, form.formState.defaultValues]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    isValidating,
    validationError,
    validate,
  };
}
