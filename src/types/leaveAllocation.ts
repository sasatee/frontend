import { z } from 'zod';

export interface LeaveAllocation {
  id: string;
  leaveTypeId: string;
  employeeId: string;
  appUserId: string;
  period: number;
  numberOfDays: number;
  dateCreated?: string;
}

export const leaveAllocationPayloadSchema = z.object({
  leaveTypeId: z.string().min(1, 'Leave type is required'),
  employeeId: z.string().min(1, 'Employee is required'),
  appUserId: z.string().min(1, 'User ID is required'),
  period: z.number().min(new Date().getFullYear(), 'Period must be current year or later'),
  numberOfDays: z.number().min(1, 'Number of days must be at least 1'),
});

export type LeaveAllocationPayload = z.infer<typeof leaveAllocationPayloadSchema>;

export interface LeaveAllocationUpdatePayload {
  numberOfDays: number;
  period: number;
}

export interface LeaveBalanceParams {
  employeeId: string;
  leaveTypeId?: string;
  period: number;
}
