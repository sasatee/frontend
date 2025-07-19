import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { authService } from '@/services/authService';

interface UseUniqueEmailValidationOptions {
  /**
   * The initial email value
   */
  initialValue?: string;

  /**
   * Debounce delay in milliseconds
   * Default: 500ms
   */
  delay?: number;

  /**
   * Whether to skip validation for the initial value
   * Default: true
   */
  skipInitialValidation?: boolean;

  /**
   * Current user's email to exclude from validation
   * (useful when updating a user's profile)
   */
  excludeEmail?: string;
}

/**
 * Custom hook for validating if an email is unique
 *
 * @param options Configuration options
 * @returns Object with validation state and functions
 */
export function useUniqueEmailValidation({
  initialValue = '',
  delay = 500,
  skipInitialValidation = true,
  excludeEmail,
}: UseUniqueEmailValidationOptions = {}) {
  const [email, setEmail] = useState<string>(initialValue);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isUnique, setIsUnique] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounce the email value to avoid excessive API calls
  const debouncedEmail = useDebounce(email, delay);

  // Function to check if email is unique
  const checkEmailUnique = useCallback(
    async (emailToCheck: string) => {
      // Skip validation if email is empty or matches the excluded email
      if (!emailToCheck || emailToCheck === excludeEmail) {
        setIsUnique(null);
        setError(null);
        return;
      }

      try {
        setIsValidating(true);
        setError(null);

        // Call API to check if email exists
        const isEmailAvailable = await authService.checkEmailAvailability(emailToCheck);

        setIsUnique(isEmailAvailable);

        if (!isEmailAvailable) {
          setError('This email is already registered');
        }
      } catch (error) {
        console.error('Error checking email uniqueness:', error);
        setError('Unable to verify email availability');
        setIsUnique(null);
      } finally {
        setIsValidating(false);
      }
    },
    [excludeEmail]
  );

  // Validate email when debounced value changes
  useEffect(() => {
    // Skip initial validation if requested
    if (skipInitialValidation && debouncedEmail === initialValue) {
      return;
    }

    checkEmailUnique(debouncedEmail);
  }, [debouncedEmail, initialValue, skipInitialValidation, checkEmailUnique]);

  // Function to manually trigger validation
  const validate = useCallback(() => {
    return checkEmailUnique(email);
  }, [email, checkEmailUnique]);

  return {
    email,
    setEmail,
    isValidating,
    isUnique,
    error,
    validate,
  };
}
