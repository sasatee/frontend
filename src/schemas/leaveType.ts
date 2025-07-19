import * as z from 'zod';
import { validators } from './validation';

// Basic leave type schema matching the API structure
export const leaveTypeSchema = z.object({
  name: validators.requiredString('Leave type name', 50),
  defaultDays: z
    .number()
    .int()
    .min(0, 'Default days cannot be negative')
    .max(365, 'Default days cannot exceed 365'),
});

export type LeaveTypeFormValues = z.infer<typeof leaveTypeSchema>;
