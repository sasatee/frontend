// @ts-ignore
import * as z from 'zod';
import { validators, validationMessages } from './validation';

// Define deduction types and their limits
const DEDUCTION_TYPES = {
  tax: { isStatutory: true, maxPercentage: 0.35 },
  pension: { isStatutory: true, maxPercentage: 0.15 },
  'health-insurance': { isStatutory: true, maxPercentage: 0.1 },
  'loan-repayment': { isStatutory: false, maxPercentage: 0.3 },
  'advance-salary': { isStatutory: false, maxPercentage: 0.5 },
  'union-dues': { isStatutory: false, maxPercentage: 0.05 },
  charity: { isStatutory: false, maxPercentage: 0.15 },
  other: { isStatutory: false, maxPercentage: 0.2 },
};

// Define the deduction schema type for type safety
type DeductionSchemaType = {
  typeName: string;
  description: string;
  amount: number;
  percentage?: number;
  isPercentage: boolean;
  employeeId: string;
  remarks?: string;
  deductionType: keyof typeof DEDUCTION_TYPES;
  isStatutory: boolean;
  startDate: Date | string;
  endDate?: Date | string;
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'annually';
  approvedBy?: string;
  documentReference?: string;
  grossSalary?: number;
};

// Deduction schema
export const deductionSchema = z
  .object({
    typeName: validators.requiredString('Type name', 100),
    description: validators.requiredString('Description', 500),
    amount: z.number().min(0, 'Amount cannot be negative'),
    percentage: z
      .number()
      .min(0, 'Percentage cannot be negative')
      .max(100, 'Percentage cannot exceed 100')
      .optional(),
    isPercentage: z.boolean().default(false),
    employeeId: validators.requiredString('Employee'),
    remarks: validators.optionalString('Remarks', 500),
    deductionType: z.enum([
      'tax',
      'pension',
      'health-insurance',
      'loan-repayment',
      'advance-salary',
      'union-dues',
      'charity',
      'other',
    ]),
    isStatutory: z.boolean().default(false),
    startDate: validators.date('Start date'),
    endDate: validators.optionalDate('End date'),
    frequency: z.enum(['one-time', 'monthly', 'quarterly', 'annually']).default('monthly'),
    approvedBy: z.string().optional(),
    documentReference: z.string().optional(),
    grossSalary: z.number().optional(),
  })
  .refine(
    (data) => {
      // If it's a percentage-based deduction, ensure percentage is provided
      if (data.isPercentage && (data.percentage === undefined || data.percentage === null)) {
        return false;
      }
      return true;
    },
    {
      message: 'Percentage is required for percentage-based deductions',
      path: ['percentage'],
    }
  )
  .refine(
    (data) => {
      // If it's a percentage-based deduction, ensure amount is calculated correctly
      if (data.isPercentage && data.percentage !== undefined && data.grossSalary !== undefined) {
        const expectedAmount = (data.percentage / 100) * data.grossSalary;
        const difference = Math.abs(data.amount - expectedAmount);

        // Allow a small margin of error (1%)
        return difference <= expectedAmount * 0.01;
      }
      return true;
    },
    {
      message: 'Amount does not match the calculated percentage of gross salary',
      path: ['amount'],
    }
  )
  .refine(
    (data) => {
      // Validate against maximum percentage for this deduction type
      if (data.deductionType && DEDUCTION_TYPES[data.deductionType]) {
        const maxPercentage = DEDUCTION_TYPES[data.deductionType].maxPercentage;

        if (data.grossSalary && data.grossSalary > 0) {
          const actualPercentage = data.amount / data.grossSalary;
          return actualPercentage <= maxPercentage;
        }
      }
      return true;
    },
    {
      message: `Deduction amount exceeds the maximum allowed percentage for this type`,
      path: ['amount'],
    }
  )
  .refine(
    (data) => {
      // Validate that statutory status matches the deduction type
      if (data.deductionType && DEDUCTION_TYPES[data.deductionType]) {
        return data.isStatutory === DEDUCTION_TYPES[data.deductionType].isStatutory;
      }
      return true;
    },
    {
      message: 'Statutory status does not match the selected deduction type',
      path: ['isStatutory'],
    }
  )
  .refine(
    (data) => {
      // If end date is provided, it must be after start date
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      // For statutory deductions, document reference is required
      if (data.isStatutory && (!data.documentReference || data.documentReference.trim() === '')) {
        return false;
      }
      return true;
    },
    {
      message: 'Document reference is required for statutory deductions',
      path: ['documentReference'],
    }
  );

// Export types
export type DeductionFormValues = z.infer<typeof deductionSchema>;
