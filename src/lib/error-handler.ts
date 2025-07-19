import { AxiosError } from 'axios';
import { toast } from '@/components/ui/use-toast';
import { ApiError } from '@/types/api';
import { DEFAULT_RETRY_COUNT, DEFAULT_RETRY_DELAY } from './constants';

/**
 * Extract error message from API error response
 */
export function getErrorMessage(error: unknown, context?: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError;

    // Handle validation errors
    if (data?.errors) {
      return Object.values(data.errors).flat().join(', ');
    }

    // Handle error message in response
    if (data?.message) {
      return data.message;
    }

    // Handle network errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }

    if (error.code === 'ERR_NETWORK') {
      return 'Network error. Please check your connection.';
    }

    // Handle HTTP status codes
    switch (error.response?.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return context ? `${context} not found.` : 'Resource not found.';
      case 409:
        return 'This operation conflicts with an existing resource.';
      case 422:
        return 'Invalid input. Please check your data.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}

/**
 * Show error toast with consistent formatting
 */
export function showErrorToast(error: unknown, context?: string): void {
  const message = getErrorMessage(error, context);

  toast({
    variant: 'destructive',
    title: context ? `Error ${context}` : 'Error',
    description: message,
  });
}

/**
 * Retry an operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = DEFAULT_RETRY_COUNT,
  initialDelay: number = DEFAULT_RETRY_DELAY,
  context?: string
): Promise<T> {
  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on certain errors
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status === 401 || status === 403 || status === 404 || status === 422) {
          throw error;
        }
      }

      // Last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  throw lastError;
}

/**
 * Handle API errors consistently
 */
export async function handleApiError<T>(operation: () => Promise<T>, context?: string): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    showErrorToast(error, context);
    throw error;
  }
}

/**
 * Handle form submission errors with consistent error handling
 */
export function handleFormSubmissionError(
  error: unknown,
  setError: (field: string, error: { type: string; message: string }) => void,
  setGlobalError: (error: string | null) => void,
  context?: string
): void {
  if (error instanceof AxiosError) {
    const data = error.response?.data;

    // Handle validation errors
    if (data?.errors) {
      Object.entries(data.errors).forEach(([field, messages]) => {
        setError(field, {
          type: 'server',
          message: Array.isArray(messages) ? messages[0] : (messages as string),
        });
      });
      return;
    }

    // Handle field-specific errors
    if (data?.fieldErrors) {
      Object.entries(data.fieldErrors).forEach(([field, message]) => {
        setError(field, {
          type: 'server',
          message: message as string,
        });
      });
      return;
    }
  }

  // Set global error for other cases
  setGlobalError(getErrorMessage(error, context));
}
