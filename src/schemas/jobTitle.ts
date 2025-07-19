import * as z from 'zod';

// Simple form schema for job title operations matching the API
export const formSchema = z.object({
  title: z
    .string()
    .min(1, 'Job title is required')
    .max(100, 'Job title cannot exceed 100 characters')
    .refine((val) => /^[a-zA-Z0-9\s\-&(),.]+$/.test(val), {
      message:
        'Job title can only contain letters, numbers, spaces, hyphens, ampersands, parentheses, and commas',
    }),
});

// Job title schema for create/update operations
export const jobTitleSchema = z.object({
  title: z
    .string()
    .min(1, 'Job title is required')
    .max(100, 'Job title cannot exceed 100 characters')
    .refine((val) => /^[a-zA-Z0-9\s\-&(),.]+$/.test(val), {
      message:
        'Job title can only contain letters, numbers, spaces, hyphens, ampersands, parentheses, and commas',
    }),
});

// Update job title schema (same as create since API structure is identical)
export const updateJobTitleSchema = jobTitleSchema;

// Type for form values
export type JobTitleFormValues = z.infer<typeof jobTitleSchema>;

// Type for API request/response
export type JobTitleDto = {
  title: string;
};
