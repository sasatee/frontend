import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';
import { Progress } from './progress';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface Step<T extends FieldValues> {
  title: string;
  description?: string;
  fields: (keyof T)[];
  component: React.ReactNode;
  validate?: (data: Partial<T>) => Promise<boolean> | boolean;
  render: (form: UseFormReturn<T>) => React.ReactNode;
}

interface MultiStepFormProps<T extends FieldValues> {
  steps: Step<T>[];
  form: UseFormReturn<T>;
  onSubmit: (values: T) => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  showProgressBar?: boolean;
  persistState?: boolean;
  persistKey?: string;
}

export function MultiStepForm<T extends FieldValues>({
  steps,
  form,
  onSubmit,
  isSubmitting = false,
  submitButtonText = 'Submit',
  showProgressBar = true,
  persistState = false,
  persistKey = 'multi_step_form',
}: MultiStepFormProps<T>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepValidationErrors, setStepValidationErrors] = useState<Record<number, string>>({});
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Calculate progress percentage
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Load form state from localStorage if enabled
  useEffect(() => {
    if (!persistState || typeof window === 'undefined') return;

    const savedState = localStorage.getItem(persistKey);
    if (!savedState) return;

    try {
      const { formValues, step, completed } = JSON.parse(savedState);
      if (formValues) form.reset(formValues);
      if (typeof step === 'number' && step >= 0 && step < steps.length) setCurrentStep(step);
      if (Array.isArray(completed)) setCompletedSteps(completed);
    } catch (error) {
      console.error('Error restoring form state:', error);
    }
  }, [persistKey, persistState, form, steps.length]);

  // Save form state to localStorage when it changes
  useEffect(() => {
    if (!persistState || typeof window === 'undefined') return;

    localStorage.setItem(
      persistKey,
      JSON.stringify({
        formValues: form.getValues(),
        step: currentStep,
        completed: completedSteps,
      })
    );
  }, [currentStep, completedSteps, form, persistKey, persistState]);

  // Handle next step
  const handleNext = async () => {
    const currentStepData = steps[currentStep];
    const fieldsToValidate = currentStepData.fields;

    // Validate current step fields and run custom validation
    const [formValid, customValid] = await Promise.all([
      form.trigger(fieldsToValidate as any),
      currentStepData.validate
        ? currentStepData.validate(form.getValues()).catch(() => false)
        : Promise.resolve(true),
    ]);

    if (!formValid || !customValid) {
      if (!customValid) {
        setStepValidationErrors((prev) => ({
          ...prev,
          [currentStep]: 'Custom validation failed',
        }));
      }
      return;
    }

    // Clear validation errors and proceed
    setStepValidationErrors((prev) => ({ ...prev, [currentStep]: '' }));
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    if (persistState && typeof window !== 'undefined') {
      localStorage.removeItem(persistKey);
    }

    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      {showProgressBar && (
        <div className="h-2.5 w-full rounded-full bg-gray-200">
          <div
            className="h-2.5 rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Current step content */}
      <div className="space-y-4">
        {steps[currentStep].render(form)}
        {stepValidationErrors[currentStep] && (
          <p className="text-sm text-destructive">{stepValidationErrors[currentStep]}</p>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0 || isSubmitting}
        >
          Previous
        </Button>
        {currentStep === steps.length - 1 ? (
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              submitButtonText
            )}
          </Button>
        ) : (
          <Button type="button" onClick={handleNext} disabled={isSubmitting}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
