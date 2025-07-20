// @ts-ignore
import * as React from 'react';
import { useId } from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { FormMessage } from './form';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { VisuallyHidden } from './visually-hidden';

/* -------------------------------------------------------------------------------------------------
 * AccessibleFormRoot
 * -----------------------------------------------------------------------------------------------*/

interface AccessibleFormRootProps extends React.FormHTMLAttributes<HTMLFormElement> {
  /**
   * The form's accessible name for screen readers
   */
  ariaLabel?: string;
  /**
   * Optional description of the form's purpose
   */
  ariaDescription?: string;
  /**
   * Whether to announce form submission errors to screen readers
   * @default true
   */
  announceErrors?: boolean;
}

const AccessibleFormRoot = React.forwardRef<HTMLFormElement, AccessibleFormRootProps>(
  ({ className, children, ariaLabel, ariaDescription, announceErrors = true, ...props }, ref) => {
    const { announce } = useAccessibility();
    const formDescriptionId = useId();
    const hasDescription = !!ariaDescription;

    const handleInvalidSubmit = React.useCallback(
      (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Find the first invalid field
        const firstInvalidField = event.currentTarget.querySelector(':invalid') as HTMLElement;

        if (firstInvalidField) {
          // Focus the first invalid field
          firstInvalidField.focus();

          // Get the field's label or name
          const fieldName =
            firstInvalidField.getAttribute('aria-label') ||
            firstInvalidField.getAttribute('name') ||
            'field';

          // Announce the error to screen readers
          if (announceErrors) {
            announce(`Form has validation errors. ${fieldName} is invalid.`, true);
          }
        }
      },
      [announce, announceErrors]
    );

    return (
      <form
        ref={ref}
        className={cn('space-y-6', className)}
        aria-label={ariaLabel}
        aria-describedby={hasDescription ? formDescriptionId : undefined}
        onInvalid={handleInvalidSubmit}
        {...props}
      >
        {hasDescription && (
          <VisuallyHidden>
            <div id={formDescriptionId}>{ariaDescription}</div>
          </VisuallyHidden>
        )}
        {children}
      </form>
    );
  }
);
AccessibleFormRoot.displayName = 'AccessibleForm';

/* -------------------------------------------------------------------------------------------------
 * AccessibleFormField
 * -----------------------------------------------------------------------------------------------*/

interface AccessibleFormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The label for the form field
   */
  label: string;
  /**
   * Whether the label should be visually hidden
   * @default false
   */
  hideLabel?: boolean;
  /**
   * Optional helper text to provide additional context
   */
  description?: string;
  /**
   * Error message to display when the field is invalid
   */
  error?: string;
  /**
   * Whether the field is required
   * @default false
   */
  required?: boolean;
  /**
   * Whether the field is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * The ID of the form control
   */
  controlId?: string;
}

const AccessibleFormField = React.forwardRef<HTMLDivElement, AccessibleFormFieldProps>(
  (
    {
      className,
      children,
      label,
      hideLabel = false,
      description,
      error,
      required = false,
      disabled = false,
      controlId: externalId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = externalId || generatedId;
    const descriptionId = description ? `${id}-description` : undefined;
    const errorId = error ? `${id}-error` : undefined;

    // Pass these IDs to any form control children
    const childrenWithProps = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          id,
          'aria-describedby': cn(descriptionId, errorId),
          'aria-invalid': error ? true : undefined,
          required,
          disabled,
          ...child.props,
        });
      }
      return child;
    });

    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {hideLabel ? (
          <VisuallyHidden>
            <Label htmlFor={id}>
              {label}
              {required && <span aria-hidden="true"> *</span>}
            </Label>
          </VisuallyHidden>
        ) : (
          <Label htmlFor={id} className={cn(error && 'text-destructive')}>
            {label}
            {required && (
              <span aria-hidden="true" className="ml-1 text-destructive">
                *
              </span>
            )}
          </Label>
        )}

        {childrenWithProps}

        {description && !error && (
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}

        {error && (
          <p id={errorId} className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }
);
AccessibleFormField.displayName = 'AccessibleFormField';

/* -------------------------------------------------------------------------------------------------
 * AccessibleFormGroup
 * -----------------------------------------------------------------------------------------------*/

interface AccessibleFormGroupProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  /**
   * The legend for the fieldset
   */
  legend: string;
  /**
   * Whether the legend should be visually hidden
   * @default false
   */
  hideLegend?: boolean;
  /**
   * Optional helper text to provide additional context
   */
  description?: string;
}

const AccessibleFormGroup = React.forwardRef<HTMLFieldSetElement, AccessibleFormGroupProps>(
  ({ className, children, legend, hideLegend = false, description, ...props }, ref) => {
    const id = useId();
    const descriptionId = description ? `${id}-description` : undefined;

    return (
      <fieldset
        ref={ref}
        className={cn('space-y-4 rounded-md border p-4', className)}
        aria-describedby={descriptionId}
        {...props}
      >
        {hideLegend ? (
          <VisuallyHidden>
            <legend>{legend}</legend>
          </VisuallyHidden>
        ) : (
          <legend className="text-sm font-medium">{legend}</legend>
        )}

        {description && (
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}

        <div className="space-y-4">{children}</div>
      </fieldset>
    );
  }
);
AccessibleFormGroup.displayName = 'AccessibleFormGroup';

/* -------------------------------------------------------------------------------------------------
 * AccessibleFormActions
 * -----------------------------------------------------------------------------------------------*/

const AccessibleFormActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center justify-end space-x-2', className)} {...props} />
));
AccessibleFormActions.displayName = 'AccessibleFormActions';

export { AccessibleFormRoot, AccessibleFormField, AccessibleFormGroup, AccessibleFormActions };
