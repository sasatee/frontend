import * as z from 'zod';

export const payrollSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  categoryGroupId: z.string().min(1, 'Category group is required'),
  yearOfService: z
    .number()
    .min(0, 'Years of service must be greater than or equal to 0')
    .max(100, 'Years of service cannot exceed 100'),
});

export type PayrollFormData = z.infer<typeof payrollSchema>;
