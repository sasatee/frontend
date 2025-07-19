import { useEffect, useRef, useCallback } from 'react';
import { useBeforeUnload, useLocation, useNavigate } from 'react-router-dom';
import { UseFormReturn, FieldValues } from 'react-hook-form';

/**
 * Hook to protect against accidental navigation when a form has unsaved changes
 * @param form - React Hook Form's form instance
 * @param isDirtyOverride - Optional override for the form's dirty state
 */
export function useFormNavProtection<T extends FieldValues>(
  form: UseFormReturn<T>,
  isDirtyOverride?: boolean
) {
  const isDirty = isDirtyOverride !== undefined ? isDirtyOverride : form.formState.isDirty;
  const navigate = useNavigate();
  const location = useLocation();

  // Show browser confirmation dialog when closing/refreshing with unsaved changes
  useBeforeUnload((event) => {
    if (isDirty) {
      event.preventDefault();
      return (event.returnValue = 'You have unsaved changes. Are you sure you want to leave?');
    }
  });

  // Custom navigation handler that shows confirmation dialog
  const handleNavigation = useCallback(
    (to: string) => {
      // Skip if navigating to the same path
      if (to === location.pathname) return true;

      // If form is dirty, ask for confirmation
      if (isDirty) {
        return window.confirm('You have unsaved changes. Are you sure you want to leave?');
      }
      return true;
    },
    [isDirty, location.pathname]
  );

  // Safe navigation function that checks for unsaved changes
  const safeNavigate = useCallback(
    (to: any, options?: any) => {
      const nextPath = typeof to === 'string' ? to : to.pathname;
      if (handleNavigation(nextPath)) {
        navigate(to, options);
      }
    },
    [handleNavigation, navigate]
  );

  return { safeNavigate };
}
