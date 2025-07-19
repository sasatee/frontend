import * as z from 'zod';
import {
  validators,
  validationPatterns,
  validationMessages,
  dateRangeValidator,
} from './validation';

// Predefined allowance types
export const ALLOWANCE_TYPES = [
  'Housing',
  'Transportation',
  'Meal',
  'Medical',
  'Education',
  'Performance Bonus',
  'Shift',
  'Remote Work',
  'Relocation',
  'Hardship',
  'Other',
] as const;

// Allowance calculation methods
export const CALCULATION_METHODS = ['Fixed', 'Percentage', 'Formula'] as const;

// Allowance schema
export const allowanceSchema = z
  .object({
    name: validators.requiredString('Allowance name', 100),
    type: z.enum(ALLOWANCE_TYPES),
    description: validators.optionalString('Description', 500),

    // Amount can be a fixed value or percentage
    amount: z.union([
      z.number().min(0, 'Amount cannot be negative'),
      z
        .string()
        .regex(validationPatterns.currencyPattern, 'Invalid amount format')
        .transform((val) => parseFloat(val)),
    ]),

    calculationMethod: z.enum(CALCULATION_METHODS),

    // For percentage-based allowances
    percentageOf: z.enum(['Basic Salary', 'Gross Salary']).optional(),

    // For formula-based allowances
    formula: z.string().optional(),

    // Effective date range
    effectiveFrom: validators.date('Effective from date'),
    effectiveTo: validators.optionalDate(),

    // Tax settings
    taxable: z.boolean().default(true),

    // Eligibility criteria
    eligibleDepartments: z.array(z.string()).optional(),
    eligibleJobGrades: z.array(z.string()).optional(),
    minimumServiceMonths: z.number().min(0, 'Minimum service months cannot be negative').optional(),

    // Frequency
    frequency: z
      .enum(['Monthly', 'Quarterly', 'Bi-annually', 'Annually', 'One-time'])
      .default('Monthly'),

    // Status
    isActive: z.boolean().default(true),

    // Optional fields
    notes: validators.optionalString('Notes', 500),
    attachments: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // If calculation method is Percentage, percentageOf is required
      if (data.calculationMethod === 'Percentage' && !data.percentageOf) {
        return false;
      }
      return true;
    },
    {
      message: 'Please specify what the percentage is based on',
      path: ['percentageOf'],
    }
  )
  .refine(
    (data) => {
      // If calculation method is Formula, formula is required
      if (data.calculationMethod === 'Formula' && !data.formula) {
        return false;
      }
      return true;
    },
    {
      message: 'Please provide a formula for calculation',
      path: ['formula'],
    }
  )
  .refine(
    (data) => {
      // If calculation method is Percentage, amount should be between 0 and 100
      if (data.calculationMethod === 'Percentage') {
        const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
        return amount >= 0 && amount <= 100;
      }
      return true;
    },
    {
      message: 'Percentage must be between 0 and 100',
      path: ['amount'],
    }
  )
  .refine(dateRangeValidator('effectiveFrom', 'effectiveTo'), {
    message: validationMessages.dateRange,
    path: ['effectiveTo'],
  })
  .refine(
    (data) => {
      // Ensure the effective from date is not in the past (unless it's a one-time allowance)
      if (data.frequency !== 'One-time') {
        const effectiveFrom = new Date(data.effectiveFrom);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return effectiveFrom >= today;
      }
      return true;
    },
    {
      message: 'Effective from date cannot be in the past for recurring allowances',
      path: ['effectiveFrom'],
    }
  );

// Bulk allowance assignment schema
export const bulkAllowanceAssignmentSchema = z
  .object({
    allowanceId: validators.requiredString('Allowance'),
    employeeIds: z.array(z.string()).min(1, 'At least one employee must be selected'),
    effectiveFrom: validators.date('Effective from date'),
    effectiveTo: validators.optionalDate(),
    notes: validators.optionalString('Notes', 500),
  })
  .refine(dateRangeValidator('effectiveFrom', 'effectiveTo'), {
    message: validationMessages.dateRange,
    path: ['effectiveTo'],
  });

// Employee allowance schema (for assigning allowances to specific employees)
export const employeeAllowanceSchema = z
  .object({
    employeeId: validators.requiredString('Employee'),
    allowanceId: validators.requiredString('Allowance'),
    amount: z.union([
      z.number().min(0, 'Amount cannot be negative'),
      z
        .string()
        .regex(validationPatterns.currencyPattern, 'Invalid amount format')
        .transform((val) => parseFloat(val)),
    ]),
    effectiveFrom: validators.date('Effective from date'),
    effectiveTo: validators.optionalDate(),
    notes: validators.optionalString('Notes', 500),
  })
  .refine(dateRangeValidator('effectiveFrom', 'effectiveTo'), {
    message: validationMessages.dateRange,
    path: ['effectiveTo'],
  });

// Export types
export type AllowanceFormValues = z.infer<typeof allowanceSchema>;
export type BulkAllowanceAssignmentFormValues = z.infer<typeof bulkAllowanceAssignmentSchema>;
export type EmployeeAllowanceFormValues = z.infer<typeof employeeAllowanceSchema>;
