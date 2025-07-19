import { z } from 'zod';

export const leaveAllocationPayloadSchema = z.object({
  leaveTypeId: z.string().uuid(),
  period: z.number().int().min(new Date().getFullYear()),
  numberOfDays: z.number().positive(),
  appUserId: z.string().uuid(),
  employeeId: z.string().uuid(),
});

export const leaveAllocationUpdatePayloadSchema = z.object({
  numberOfDays: z.number().positive(),
  period: z.number().int().min(new Date().getFullYear()),
});
