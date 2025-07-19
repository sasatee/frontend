import * as z from 'zod';

// Simple form schema for department operations matching the API
export const formSchema = z.object({
  departmentName: z
    .string()
    .min(1, 'Department name is required')
    .max(100, 'Department name cannot exceed 100 characters')
    .refine((val) => /^[a-zA-Z0-9\s\-&(),.]+$/.test(val), {
      message:
        'Department name can only contain letters, numbers, spaces, hyphens, ampersands, parentheses, and commas',
    }),
  headOfDepartment: z
    .string()
    .min(1, 'Head of department is required')
    .max(100, 'Head of department cannot exceed 100 characters')
    .refine((val) => /^[a-zA-Z\s\-',.]+$/.test(val), {
      message:
        'Head of department can only contain letters, spaces, hyphens, apostrophes, and commas',
    }),
});

// Department schema for create/update operations
export const departmentSchema = z.object({
  departmentName: z
    .string()
    .min(1, 'Department name is required')
    .max(100, 'Department name cannot exceed 100 characters')
    .refine((val) => /^[a-zA-Z0-9\s\-&(),.]+$/.test(val), {
      message:
        'Department name can only contain letters, numbers, spaces, hyphens, ampersands, parentheses, and commas',
    }),
  headOfDepartment: z
    .string()
    .min(1, 'Head of department is required')
    .max(100, 'Head of department cannot exceed 100 characters')
    .refine((val) => /^[a-zA-Z\s\-',.]+$/.test(val), {
      message:
        'Head of department can only contain letters, spaces, hyphens, apostrophes, and commas',
    }),
});

// Update department schema (same as create since API structure is identical)
export const updateDepartmentSchema = departmentSchema;

// Type for form values
export type DepartmentFormValues = z.infer<typeof departmentSchema>;

// Type for API request/response
export type DepartmentDto = {
  departmentName: string;
  headOfDepartment: string;
};
