import * as z from 'zod';
import { validators, validationPatterns, validationMessages } from './validation';

export const employeeSchema = z.object({
  firstName: validators
    .requiredString('First name', 50)
    .regex(
      validationPatterns.namePattern,
      'First name should contain only letters, spaces, hyphens and apostrophes'
    ),

  lastName: validators
    .requiredString('Last name', 50)
    .regex(
      validationPatterns.namePattern,
      'Last name should contain only letters, spaces, hyphens and apostrophes'
    ),

  email: validators.email(),

  phone: validators.phone(),

  address: validators.address('Address'),

  postalCode: validators.postalCode(),

  city: validators
    .requiredString('City', 50)
    .regex(
      validationPatterns.namePattern,
      'City should contain only letters, spaces, hyphens and apostrophes'
    ),

  country: validators
    .requiredString('Country', 50)
    .regex(
      validationPatterns.namePattern,
      'Country should contain only letters, spaces, hyphens and apostrophes'
    ),

  departmentId: validators.requiredString('Department'),

  jobTitleId: validators.requiredString('Job title'),

  categoryGroupId: validators.requiredString('Category group'),

  nic: z.string().optional(),

  dateOfJoining: z
    .union([
      z.date(),
      z
        .string()
        .regex(validationPatterns.datePattern, validationMessages.dateFormat)
        .transform((str) => new Date(str)),
      z.literal(undefined),
    ])
    .optional()
    .refine(
      (date) => {
        if (!date) return true;
        return date <= new Date();
      },
      {
        message: 'Joining date cannot be in the future',
      }
    ),

  dateOfTermination: z
    .union([
      z.date(),
      z
        .string()
        .regex(validationPatterns.datePattern, validationMessages.dateFormat)
        .transform((str) => new Date(str)),
      z.literal(''),
      z.literal(undefined),
    ])
    .optional(),

  gender: z.enum(['Male', 'Female', 'Other']).refine((val) => !!val, {
    message: 'Gender is required',
  }),

  dateOfBirth: z
    .union([
      z.date(),
      z
        .string()
        .regex(validationPatterns.datePattern, validationMessages.dateFormat)
        .transform((str) => new Date(str)),
      z.literal(''),
      z.literal(undefined),
    ])
    .optional()
    .refine(
      (date) => {
        if (!date) return true;
        const today = new Date();
        const birthDate = new Date(date);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age >= 18;
      },
      {
        message: 'Employee must be at least 18 years old',
      }
    ),

  emergencyContactName: validators.optionalString('Emergency contact name', 100),

  emergencyContactPhone: z
    .string()
    .optional()
    .refine(
      (phone) => {
        if (!phone || phone === '') return true;
        return validationPatterns.phonePattern.test(phone);
      },
      {
        message: validationMessages.phone,
      }
    ),

  bankAccountNumber: z
    .string()
    .optional()
    .refine(
      (account) => {
        if (!account || account === '') return true;
        return /^[A-Z0-9]{5,30}$/.test(account);
      },
      {
        message: 'Please enter a valid bank account number',
      }
    ),

  yearsOfService: z.number().min(0, 'Years of service cannot be negative').optional(),
});

// Add cross-field validation
export const enhancedEmployeeSchema = employeeSchema.refine(
  (data) => {
    // If termination date is provided, it must be after joining date
    if (data.dateOfJoining && data.dateOfTermination) {
      return new Date(data.dateOfTermination) >= new Date(data.dateOfJoining);
    }
    return true;
  },
  {
    message: 'Termination date must be after joining date',
    path: ['dateOfTermination'],
  }
);

export type EmployeeFormValues = z.infer<typeof enhancedEmployeeSchema>;
