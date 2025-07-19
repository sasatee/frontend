import * as z from 'zod';
import { validators, validationPatterns, validationMessages } from './validation';

export const attendanceFormSchema = z
  .object({
    employeeId: validators.requiredString('Employee ID'),
    date: validators.date('Attendance date'),
    checkInTime: z
      .string()
      .min(1, 'Check-in time is required')
      .regex(validationPatterns.timePattern, validationMessages.timeFormat),
    checkOutTime: z
      .string()
      .min(1, 'Check-out time is required')
      .regex(validationPatterns.timePattern, validationMessages.timeFormat),
    overtimeHours: z
      .number()
      .min(0, 'Overtime hours cannot be negative')
      .max(8, 'Overtime hours cannot exceed 8 hours per day'),
    status: z.enum(['Present', 'Absent', 'HalfDay', 'OnLeave']).optional(),
  })
  .refine(
    (data) => {
      if (!data.checkInTime || !data.checkOutTime) return true;

      const [checkInHour, checkInMinute] = data.checkInTime.split(':').map(Number);
      const [checkOutHour, checkOutMinute] = data.checkOutTime.split(':').map(Number);

      // Convert to minutes for easier comparison
      const checkInMinutes = checkInHour * 60 + checkInMinute;
      const checkOutMinutes = checkOutHour * 60 + checkOutMinute;

      return checkOutMinutes > checkInMinutes;
    },
    {
      message: 'Check-out time must be after check-in time',
      path: ['checkOutTime'],
    }
  )
  .refine(
    (data) => {
      if (!data.checkInTime || !data.checkOutTime) return true;

      // Validate minimum working hours
      const [checkInHour, checkInMinute] = data.checkInTime.split(':').map(Number);
      const [checkOutHour, checkOutMinute] = data.checkOutTime.split(':').map(Number);

      const checkInMinutes = checkInHour * 60 + checkInMinute;
      const checkOutMinutes = checkOutHour * 60 + checkOutMinute;
      const workingMinutes = checkOutMinutes - checkInMinutes;

      // If status is HalfDay, require at least 4 hours
      if (data.status === 'HalfDay' && workingMinutes < 240) {
        return false;
      }

      // If status is Present, require at least 7 hours
      if ((data.status === 'Present' || !data.status) && workingMinutes < 420) {
        return false;
      }

      return true;
    },
    {
      message:
        'Working hours must meet minimum requirements (7 hours for full day, 4 hours for half day)',
      path: ['checkOutTime'],
    }
  )
  .refine(
    (data) => {
      // Prevent future attendance records
      if (!data.date) return true;

      const attendanceDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return attendanceDate <= today;
    },
    {
      message: 'Cannot record attendance for future dates',
      path: ['date'],
    }
  );

export type AttendanceFormValues = z.infer<typeof attendanceFormSchema>;

// Attendance bulk upload schema
export const attendanceBulkUploadSchema = z.array(
  z.object({
    employeeId: validators.requiredString('Employee ID'),
    date: validators.date('Attendance date'),
    checkInTime: z
      .string()
      .min(1, 'Check-in time is required')
      .regex(validationPatterns.timePattern, validationMessages.timeFormat),
    checkOutTime: z
      .string()
      .min(1, 'Check-out time is required')
      .regex(validationPatterns.timePattern, validationMessages.timeFormat),
    status: z.enum(['Present', 'Absent', 'HalfDay', 'OnLeave']).optional(),
  })
);

export type AttendanceBulkUploadValues = z.infer<typeof attendanceBulkUploadSchema>;

// Attendance correction request schema
export const attendanceCorrectionSchema = z
  .object({
    employeeId: validators.requiredString('Employee ID'),
    date: validators.date('Attendance date'),
    originalCheckInTime: z
      .string()
      .regex(validationPatterns.timePattern, validationMessages.timeFormat)
      .optional(),
    originalCheckOutTime: z
      .string()
      .regex(validationPatterns.timePattern, validationMessages.timeFormat)
      .optional(),
    correctedCheckInTime: z
      .string()
      .regex(validationPatterns.timePattern, validationMessages.timeFormat)
      .optional(),
    correctedCheckOutTime: z
      .string()
      .regex(validationPatterns.timePattern, validationMessages.timeFormat)
      .optional(),
    reason: validators.requiredString('Reason', 500),
    attachments: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // Either corrected check-in or check-out time must be provided
      return !!data.correctedCheckInTime || !!data.correctedCheckOutTime;
    },
    {
      message: 'At least one corrected time must be provided',
      path: ['correctedCheckInTime'],
    }
  );

export type AttendanceCorrectionFormValues = z.infer<typeof attendanceCorrectionSchema>;
