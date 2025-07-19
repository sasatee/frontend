import { useState, useCallback, useRef, useEffect } from 'react';

interface UseFormThrottleOptions {
  throttleTime?: number;
  maxAttempts?: number;
  debug?: boolean;
}

interface ThrottleError extends Error {
  retryAfter?: number;
}

/**
 * Hook to prevent rapid form submissions with exponential backoff
 *
 * @param options Configuration options
 * @returns Object with isThrottled state and throttleSubmit function
 */
export function useFormThrottle({
  throttleTime = 2000,
  maxAttempts = 3,
  debug = false,
}: UseFormThrottleOptions = {}) {
  const [isThrottled, setIsThrottled] = useState(false);
  const lastSubmitTime = useRef<number>(0);
  const submissionCount = useRef<number>(0);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  // Cleanup function
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, []);

  const createThrottleError = (message: string, retryAfter: number): ThrottleError => {
    const error = new Error(message) as ThrottleError;
    error.retryAfter = retryAfter;
    return error;
  };

  /**
   * Wraps a form submission function with throttling logic
   *
   * @param submitFn The original submission function
   * @returns A throttled version of the submission function
   */
  const throttleSubmit = useCallback(
    <T extends any[], R>(submitFn: (...args: T) => Promise<R>) => {
      return async (...args: T): Promise<R> => {
        const now = Date.now();
        const timeSinceLastSubmit = now - lastSubmitTime.current;

        // Check if we're within the throttle time
        if (timeSinceLastSubmit < throttleTime) {
          setIsThrottled(true);

          if (debug) {
            console.log(
              `Form submission throttled. Please wait ${Math.ceil(
                (throttleTime - timeSinceLastSubmit) / 1000
              )} seconds.`
            );
          }

          // Increment rapid submission counter
          submissionCount.current += 1;

          // If user is repeatedly trying to submit, increase the throttle time
          if (submissionCount.current > maxAttempts) {
            const penaltyTime = Math.min(submissionCount.current * 1000, 10000);
            const totalDelay = throttleTime + penaltyTime;

            if (debug) {
              console.log(
                `Multiple rapid submissions detected. Adding ${penaltyTime / 1000}s penalty.`
              );
            }

            // Clear any existing timeout
            if (throttleTimeoutRef.current) {
              clearTimeout(throttleTimeoutRef.current);
            }

            // Set a new timeout with penalty
            throttleTimeoutRef.current = setTimeout(() => {
              if (isMounted.current) {
                setIsThrottled(false);
                submissionCount.current = 0;
              }
            }, totalDelay);

            throw createThrottleError(
              `Too many submission attempts. Please wait ${totalDelay / 1000} seconds.`,
              totalDelay
            );
          }

          throw createThrottleError(
            `Please wait ${Math.ceil((throttleTime - timeSinceLastSubmit) / 1000)} seconds between submissions.`,
            throttleTime - timeSinceLastSubmit
          );
        }

        try {
          // Update the last submission time
          lastSubmitTime.current = now;
          submissionCount.current = 0;

          // Execute the original submission function
          const result = await submitFn(...args);

          if (isMounted.current) {
            // Set throttled state to prevent immediate resubmission
            setIsThrottled(true);

            // Clear any existing timeout
            if (throttleTimeoutRef.current) {
              clearTimeout(throttleTimeoutRef.current);
            }

            // Reset the throttled state after the throttle time
            throttleTimeoutRef.current = setTimeout(() => {
              if (isMounted.current) {
                setIsThrottled(false);
              }
            }, throttleTime);
          }

          return result;
        } catch (error) {
          // Still update the last submission time on error
          lastSubmitTime.current = now;

          // Rethrow the error with additional context
          if (error instanceof Error) {
            throw createThrottleError(`Form submission failed: ${error.message}`, throttleTime);
          }
          throw error;
        }
      };
    },
    [throttleTime, maxAttempts, debug]
  );

  return {
    isThrottled,
    throttleSubmit,
  };
}
