import * as z from 'zod';
import { isWeekend, isWithinInterval, differenceInDays, addDays } from 'date-fns';

// Validation patterns
export const validationPatterns = {
  emailPattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phonePattern: /^\+?[0-9]{10,15}$/,
  passwordPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  strongPasswordPattern:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{}|;:,.<>?])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{}|;:,.<>?]{10,}$/,
  namePattern: /^[a-zA-Z\s\-']+$/,
  alphanumericPattern: /^[a-zA-Z0-9]+$/,
  alphanumericWithSpace: /^[a-zA-Z0-9\s]+$/,
  alphanumericWithSpecialChars: /^[a-zA-Z0-9\s\-_@./#&+,()]*$/,
  datePattern: /^\d{4}-\d{2}-\d{2}$/,
  timePattern: /^([01]\d|2[0-3]):([0-5]\d)$/,
  currencyPattern: /^\d+(\.\d{1,2})?$/,
  percentagePattern: /^(100(\.0{1,2})?|[0-9]{1,2}(\.[0-9]{1,2})?)%?$/,
  zipCodePattern: /^\d{5}(-\d{4})?$/,
  urlPattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  employeeIdPattern: /^[A-Z]{3}[0-9]{4,6}$/,
  nationalIdPattern: /^[A-Z0-9]{6,12}$/,
  departmentCodePattern: /^[A-Z]{2,5}$/,
  hexColorPattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  addressPattern: /^[a-zA-Z0-9\s,.\-#]+$/,
  postalCodePattern: /^[a-zA-Z0-9\s-]{3,10}$/,
  ipAddressPattern: /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/,
};

// Common validation messages
export const validationMessages = {
  required: (field: string) => `${field} is required`,
  minLength: (field: string, length: number) => `${field} must be at least ${length} characters`,
  maxLength: (field: string, length: number) => `${field} cannot exceed ${length} characters`,
  pattern: (field: string) => `${field} format is invalid`,
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  password:
    'Password must contain at least 8 characters, including uppercase, lowercase, number and special character',
  strongPassword:
    'Password must contain at least 10 characters, including uppercase, lowercase, number and special character',
  dateFormat: 'Date must be in YYYY-MM-DD format',
  timeFormat: 'Time must be in HH:MM format (24-hour)',
  dateRange: 'End date must be after start date',
  minimumAge: (years: number) => `Must be at least ${years} years old`,
  numeric: 'Please enter a valid number',
  integer: 'Please enter a whole number',
  positiveNumber: 'Please enter a positive number',
  maxFileSize: (size: number) => `File size cannot exceed ${size} MB`,
  allowedFileTypes: (types: string[]) =>
    `File must be one of the following types: ${types.join(', ')}`,
  uniqueValue: (field: string) => `This ${field} is already in use`,
  invalidSelection: 'Please select a valid option',
  passwordMismatch: 'Passwords do not match',
  invalidCurrency: 'Please enter a valid currency amount',
  invalidPercentage: 'Please enter a valid percentage (0-100)',
  futureDate: 'Date cannot be in the future',
  pastDate: 'Date cannot be in the past',
  maxValue: (field: string, max: number) => `${field} cannot exceed ${max}`,
  minValue: (field: string, min: number) => `${field} must be at least ${min}`,
  invalidFormat: (field: string, format: string) => `${field} must be in ${format} format`,
  maxHoursPerDay: 'Working hours cannot exceed 16 hours per day',
  minBreakTime: 'Minimum break time required based on shift length',
  maxConsecutiveLeave: (days: number) => `Maximum consecutive leave days allowed is ${days}`,
  minNoticeRequired: (days: number) => `Minimum notice period required is ${days} days`,
  maxDeductionPercentage: (percent: number) =>
    `Deductions cannot exceed ${percent}% of gross salary`,
  invalidAddress: 'Please enter a valid address',
  invalidPostalCode: 'Please enter a valid postal/zip code',
  sessionExpired: 'Your session has expired. Please log in again.',
  inactivityTimeout: 'You have been logged out due to inactivity.',
  duplicateRecord: 'This record already exists in the system.',
};

// Core validators
export const validators = {
  // String validators
  requiredString: (fieldName: string, maxLength = 255) =>
    z
      .string()
      .min(1, validationMessages.required(fieldName))
      .max(maxLength, validationMessages.maxLength(fieldName, maxLength)),

  optionalString: (fieldName: string, maxLength = 255) =>
    z.string().max(maxLength, validationMessages.maxLength(fieldName, maxLength)).optional(),

  // Email validator
  email: (fieldName = 'Email') =>
    z.string().min(1, validationMessages.required(fieldName)).email(validationMessages.email),

  // Phone validator
  phone: (fieldName = 'Phone number') =>
    z
      .string()
      .min(1, validationMessages.required(fieldName))
      .regex(validationPatterns.phonePattern, validationMessages.phone),

  // Password validator
  password: (fieldName = 'Password', strong = false) =>
    z
      .string()
      .min(strong ? 10 : 8, validationMessages.minLength(fieldName, strong ? 10 : 8))
      .regex(
        strong ? validationPatterns.strongPasswordPattern : validationPatterns.passwordPattern,
        strong ? validationMessages.strongPassword : validationMessages.password
      ),

  // Date validator
  date: (fieldName = 'Date') =>
    z.union([
      z.date(),
      z
        .string()
        .min(1, validationMessages.required(fieldName))
        .regex(validationPatterns.datePattern, validationMessages.dateFormat)
        .transform((str) => new Date(str)),
    ]),

  // Optional date validator
  optionalDate: (fieldName = 'Date') =>
    z
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

  // Number validators
  requiredNumber: (fieldName: string, minValue?: number, maxValue?: number) => {
    // Create a simple number schema
    const baseSchema = z.number();

    // Apply min constraint if provided
    const withMin =
      minValue !== undefined
        ? baseSchema.min(minValue, validationMessages.minValue(fieldName, minValue))
        : baseSchema;

    // Apply max constraint if provided
    const withMax =
      maxValue !== undefined
        ? withMin.max(maxValue, validationMessages.maxValue(fieldName, maxValue))
        : withMin;

    // Allow string input that can be parsed to number
    return z.union([
      withMax,
      z
        .string()
        .regex(validationPatterns.currencyPattern)
        .transform((val) => parseFloat(val))
        .pipe(withMax),
    ]);
  },

  optionalNumber: (fieldName: string, minValue?: number, maxValue?: number) => {
    // Create a simple number schema
    const baseSchema = z.number();

    // Apply min constraint if provided
    const withMin =
      minValue !== undefined
        ? baseSchema.min(minValue, validationMessages.minValue(fieldName, minValue))
        : baseSchema;

    // Apply max constraint if provided
    const withMax =
      maxValue !== undefined
        ? withMin.max(maxValue, validationMessages.maxValue(fieldName, maxValue))
        : withMin;

    // Allow string input that can be parsed to number and make it optional
    return z
      .union([
        withMax,
        z
          .string()
          .regex(validationPatterns.currencyPattern)
          .transform((val) => parseFloat(val))
          .pipe(withMax),
      ])
      .optional();
  },

  // Employee ID validator
  employeeId: (fieldName = 'Employee ID') =>
    z
      .string()
      .min(1, validationMessages.required(fieldName))
      .regex(validationPatterns.alphanumericPattern, validationMessages.pattern(fieldName)),

  // Employee ID validator with company prefix
  employeeIdWithPrefix: (prefix: string, fieldName = 'Employee ID') =>
    z
      .string()
      .min(1, validationMessages.required(fieldName))
      .regex(
        new RegExp(`^${prefix}[0-9]{4,6}$`),
        `${fieldName} must start with ${prefix} followed by 4-6 digits`
      ),

  // National ID validator
  nationalId: (fieldName = 'National ID') =>
    z
      .string()
      .min(1, validationMessages.required(fieldName))
      .regex(validationPatterns.nationalIdPattern, validationMessages.pattern(fieldName)),

  // Department code validator
  departmentCode: (fieldName = 'Department code') =>
    z
      .string()
      .min(1, validationMessages.required(fieldName))
      .regex(
        validationPatterns.departmentCodePattern,
        'Department code must be 2-5 uppercase letters'
      ),

  // URL validator
  url: (fieldName = 'URL') =>
    z
      .string()
      .min(1, validationMessages.required(fieldName))
      .regex(validationPatterns.urlPattern, validationMessages.pattern(fieldName)),

  // Color validator
  color: (fieldName = 'Color') =>
    z
      .string()
      .min(1, validationMessages.required(fieldName))
      .regex(validationPatterns.hexColorPattern, 'Must be a valid hex color (e.g., #FF5733)'),

  // Percentage validator
  percentage: (fieldName = 'Percentage', min = 0, max = 100) => {
    const baseSchema = z
      .number()
      .min(min, `${fieldName} must be at least ${min}%`)
      .max(max, `${fieldName} cannot exceed ${max}%`);

    return z.union([
      baseSchema,
      z
        .string()
        .regex(validationPatterns.percentagePattern, validationMessages.invalidPercentage)
        .transform((val) => parseFloat(val.replace('%', '')))
        .pipe(baseSchema),
    ]);
  },

  // Address validator
  address: (fieldName = 'Address') =>
    z
      .string()
      .min(1, validationMessages.required(fieldName))
      .regex(validationPatterns.addressPattern, validationMessages.invalidAddress),

  // Postal/Zip code validator
  postalCode: (fieldName = 'Postal/Zip Code') =>
    z
      .string()
      .min(1, validationMessages.required(fieldName))
      .regex(validationPatterns.postalCodePattern, validationMessages.invalidPostalCode),

  // File upload validator
  fileUpload: (
    maxSizeMB = 5,
    allowedTypes: string[] = ['image/jpeg', 'image/png', 'application/pdf']
  ) =>
    z
      .any()
      .refine(
        (file) => {
          if (!file || !(file instanceof File)) return true;
          return file.size <= maxSizeMB * 1024 * 1024;
        },
        {
          message: validationMessages.maxFileSize(maxSizeMB),
        }
      )
      .refine(
        (file) => {
          if (!file || !(file instanceof File)) return true;
          return allowedTypes.includes(file.type);
        },
        {
          message: validationMessages.allowedFileTypes(allowedTypes),
        }
      ),

  // Working hours validator
  workingHours: (checkInField: string, checkOutField: string, maxHours = 16) => {
    return (data: any) => {
      if (!data[checkInField] || !data[checkOutField]) return true;

      const checkIn = new Date(`2000-01-01T${data[checkInField]}`);
      const checkOut = new Date(`2000-01-01T${data[checkOutField]}`);

      // If checkout is earlier than checkin, assume it's the next day
      let hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
      if (hours < 0) {
        hours += 24;
      }

      return hours <= maxHours;
    };
  },

  // Break time validator based on shift length
  minimumBreakTime: (shiftLengthHours: number, breakMinutes: number) => {
    const requiredBreakMinutes = shiftLengthHours >= 8 ? 30 : shiftLengthHours >= 6 ? 15 : 0;
    return breakMinutes >= requiredBreakMinutes;
  },

  // IP Address validator
  ipAddress: (fieldName = 'IP Address') =>
    z.string().regex(validationPatterns.ipAddressPattern, `Please enter a valid ${fieldName}`),
};

// Date range validator function
export const dateRangeValidator = (startDateField: string, endDateField: string) => {
  return (data: any) => {
    if (!data[startDateField] || !data[endDateField]) return true;

    const startDate = new Date(data[startDateField]);
    const endDate = new Date(data[endDateField]);

    return endDate >= startDate;
  };
};

// Minimum age validator function
export const minimumAgeValidator = (dateField: string, minAge: number) => {
  return (data: any) => {
    if (!data[dateField]) return true;

    const birthDate = new Date(data[dateField]);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= minAge;
  };
};

// Advanced date range validator with business rules
export interface AdvancedDateRangeOptions {
  minDays?: number;
  maxDays?: number;
  allowWeekends?: boolean;
  allowHolidays?: boolean;
  holidays?: string[];
}

export const advancedDateRangeValidator = (
  startDateField: string,
  endDateField: string,
  options: AdvancedDateRangeOptions = {}
) => {
  const {
    minDays = 1,
    maxDays = 365,
    allowWeekends = true,
    allowHolidays = true,
    holidays = [],
  } = options;

  return (data: any) => {
    if (!data[startDateField] || !data[endDateField]) return true;

    const startDate = new Date(data[startDateField]);
    const endDate = new Date(data[endDateField]);

    // Basic validation: end date must be after start date
    if (endDate < startDate) return false;

    // Convert holidays to Date objects for comparison
    const holidayDates = holidays.map((h) => new Date(h));

    // Calculate business days between dates
    let businessDays = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const isHoliday = holidayDates.some(
        (holiday) =>
          holiday.getDate() === currentDate.getDate() &&
          holiday.getMonth() === currentDate.getMonth() &&
          holiday.getFullYear() === currentDate.getFullYear()
      );

      const isWeekendDay = isWeekend(currentDate);

      if ((allowWeekends || !isWeekendDay) && (allowHolidays || !isHoliday)) {
        businessDays++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return businessDays >= minDays && businessDays <= maxDays;
  };
};

// Business rule validators
export const businessRuleValidators = {
  // Validate overtime hours
  validateOvertimeHours: (overtimeField: string, maxHours: number) => {
    return (data: any) => {
      if (!data[overtimeField] || data[overtimeField] === 0) return true;
      return data[overtimeField] <= maxHours;
    };
  },

  // Validate deduction limit
  validateDeductionLimit: (deductionsField: string, salaryField: string, maxPercentage: number) => {
    return (data: any) => {
      if (!data[deductionsField] || !data[salaryField]) return true;

      const deductions = Array.isArray(data[deductionsField])
        ? data[deductionsField].reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
        : data[deductionsField];

      const maxDeduction = data[salaryField] * (maxPercentage / 100);
      return deductions <= maxDeduction;
    };
  },

  // Validate leave request against available balance
  leaveRequestWithinBalance: (
    startDateField: string,
    endDateField: string,
    leaveTypeField: string,
    balances: Record<string, number>
  ) => {
    return (data: any) => {
      if (!data[startDateField] || !data[endDateField] || !data[leaveTypeField]) return true;

      const startDate = new Date(data[startDateField]);
      const endDate = new Date(data[endDateField]);
      const leaveTypeId = data[leaveTypeField];

      // Calculate number of days requested
      const daysDifference = differenceInDays(endDate, startDate) + 1;

      // Get available balance
      const availableBalance = balances[leaveTypeId] || 0;

      return daysDifference <= availableBalance;
    };
  },

  // Validate employee eligibility for leave type
  validateLeaveEligibility: (
    employeeField: string,
    leaveTypeField: string,
    eligibilityCriteria: Record<string, Record<string, any>>
  ) => {
    return (data: any) => {
      if (!data[employeeField] || !data[leaveTypeField]) return true;

      const employeeId = data[employeeField];
      const leaveTypeId = data[leaveTypeField];

      // Check if employee meets eligibility criteria for this leave type
      const criteria = eligibilityCriteria[leaveTypeId];
      if (!criteria) return true;

      // In a real implementation, this would check against employee data
      // For now, we'll assume all employees are eligible
      return true;
    };
  },

  // Validate salary range based on job grade
  validateSalaryRange: (
    salaryField: string,
    jobGradeField: string,
    salaryRanges: Record<string, { min: number; max: number }>
  ) => {
    return (data: any) => {
      if (!data[salaryField] || !data[jobGradeField]) return true;

      const salary = data[salaryField];
      const jobGrade = data[jobGradeField];
      const range = salaryRanges[jobGrade];

      if (!range) return true;
      return salary >= range.min && salary <= range.max;
    };
  },
};

// Conditional validation
export const conditionalValidation = {
  // Apply validation only if condition is true
  when: <T>(
    condition: (data: T) => boolean,
    thenCheck: (data: T) => boolean,
    elseCheck?: (data: T) => boolean
  ) => {
    return (data: T) => {
      if (condition(data)) {
        return thenCheck(data);
      }
      return elseCheck ? elseCheck(data) : true;
    };
  },

  // Apply validation only if field has value
  whenFieldHasValue: <T>(field: keyof T, thenCheck: (data: T) => boolean) => {
    return (data: T) => {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        return thenCheck(data);
      }
      return true;
    };
  },

  // Apply validation only if field equals value
  whenFieldEquals: <T>(field: keyof T, value: any, thenCheck: (data: T) => boolean) => {
    return (data: T) => {
      if (data[field] === value) {
        return thenCheck(data);
      }
      return true;
    };
  },
};

// Role-based validation
export const roleBasedValidation = {
  // Apply validation only for specific roles
  forRoles: <T>(roles: string[], validation: (data: T) => boolean, userRole: string) => {
    return (data: T) => {
      if (roles.includes(userRole)) {
        return validation(data);
      }
      return true;
    };
  },

  // Apply different validations based on role
  byRole: <T>(
    validations: Record<string, (data: T) => boolean>,
    defaultValidation: (data: T) => boolean,
    userRole: string
  ) => {
    return (data: T) => {
      if (validations[userRole]) {
        return validations[userRole](data);
      }
      return defaultValidation(data);
    };
  },
};

// Unique value validator factory
export const createUniqueValidator = <T>(
  checkFunction: (value: string, excludeId?: string) => Promise<boolean>,
  errorMessage: string
) => {
  return (excludeId?: string) => {
    return async (value: string, ctx: z.RefinementCtx) => {
      const isUnique = await checkFunction(value, excludeId);
      if (!isUnique) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: errorMessage,
        });
      }
    };
  };
};

// Cross-field validation
export const crossFieldValidation = {
  // Fields must be equal
  fieldsEqual: <T>(field1: keyof T, field2: keyof T, errorMessage: string) => {
    return (data: T) => {
      return data[field1] === data[field2] || { message: errorMessage, path: [field2] };
    };
  },

  // First field must be greater than second field
  fieldGreaterThan: <T>(field1: keyof T, field2: keyof T, errorMessage: string) => {
    return (data: T) => {
      if (data[field1] === undefined || data[field2] === undefined) return true;
      return (
        (data[field1] as number) > (data[field2] as number) || {
          message: errorMessage,
          path: [field1],
        }
      );
    };
  },

  // Sum of fields must equal target
  sumEquals: <T>(fields: (keyof T)[], target: number, errorMessage: string) => {
    return (data: T) => {
      const sum = fields.reduce((acc, field) => acc + ((data[field] as number) || 0), 0);
      return sum === target || { message: errorMessage, path: [fields[0]] };
    };
  },

  // At least one field must have a value
  atLeastOneRequired: <T>(fields: (keyof T)[], errorMessage: string) => {
    return (data: T) => {
      const hasValue = fields.some((field) => {
        const value = data[field];
        return value !== undefined && value !== null && value !== '';
      });
      return hasValue || { message: errorMessage, path: [fields[0]] };
    };
  },
};

// Document validation
export const documentValidation = {
  // Check if document is expired
  isNotExpired: (expiryDateField: string, errorMessage = 'Document is expired') => {
    return (data: any) => {
      if (!data[expiryDateField]) return true;

      const expiryDate = new Date(data[expiryDateField]);
      const today = new Date();

      return expiryDate >= today || { message: errorMessage, path: [expiryDateField] };
    };
  },

  // Check if document will expire soon (within specified days)
  willExpireSoon: (expiryDateField: string, daysThreshold = 30, errorMessage?: string) => {
    return (data: any) => {
      if (!data[expiryDateField]) return true;

      const expiryDate = new Date(data[expiryDateField]);
      const today = new Date();
      const thresholdDate = addDays(today, daysThreshold);

      if (expiryDate <= thresholdDate && expiryDate >= today) {
        return {
          message: errorMessage || `Document will expire within ${daysThreshold} days`,
          path: [expiryDateField],
          type: 'warning',
        };
      }

      return true;
    };
  },
};

// Workflow validation
export const workflowValidation = {
  // Validate state transitions
  allowedTransition: (
    currentStateField: string,
    newStateField: string,
    allowedTransitions: Record<string, string[]>,
    errorMessage = 'Invalid state transition'
  ) => {
    return (data: any) => {
      const currentState = data[currentStateField];
      const newState = data[newStateField];

      if (!currentState || !newState) return true;

      const allowed = allowedTransitions[currentState] || [];
      return allowed.includes(newState) || { message: errorMessage, path: [newStateField] };
    };
  },

  // Validate required approvals
  requiredApprovals: (
    approvalsField: string,
    requiredCount: number,
    errorMessage = `At least ${requiredCount} approvals required`
  ) => {
    return (data: any) => {
      const approvals = data[approvalsField] || [];
      return approvals.length >= requiredCount || { message: errorMessage, path: [approvalsField] };
    };
  },
};

// Maximum consecutive leave days validator
export const maxConsecutiveLeaveValidator = (
  startDateField: string,
  endDateField: string,
  maxDays: number
) => {
  return (data: any) => {
    if (!data[startDateField] || !data[endDateField]) return true;

    const startDate = new Date(data[startDateField]);
    const endDate = new Date(data[endDateField]);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates

    return diffDays <= maxDays;
  };
};

// Minimum notice period validator
export const minNoticePeriodValidator = (
  startDateField: string,
  submissionDate = new Date(),
  minDays: number
) => {
  return (data: any) => {
    if (!data[startDateField]) return true;

    const startDate = new Date(data[startDateField]);
    const diffTime = Math.abs(startDate.getTime() - submissionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= minDays;
  };
};

// Maximum deduction percentage validator
export const maxDeductionPercentageValidator = (
  deductionAmountField: string,
  grossSalaryField: string,
  maxPercentage: number
) => {
  return (data: any) => {
    if (!data[deductionAmountField] || !data[grossSalaryField]) return true;

    const deductionAmount = parseFloat(data[deductionAmountField]);
    const grossSalary = parseFloat(data[grossSalaryField]);

    if (isNaN(deductionAmount) || isNaN(grossSalary) || grossSalary === 0) return true;

    const percentage = (deductionAmount / grossSalary) * 100;
    return percentage <= maxPercentage;
  };
};
