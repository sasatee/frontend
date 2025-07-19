import {
  COMPANY_HOLIDAYS,
  MOCK_EXISTING_LEAVE_REQUESTS,
  MOCK_LEAVE_BALANCES,
} from '@/lib/mock-data';
import * as z from 'zod';
import {
  advancedDateRangeValidator,
  businessRuleValidators,
  dateRangeValidator,
  maxConsecutiveLeaveValidator,
  validationMessages
} from './validation';

// Function to check for overlapping leave requests
const hasOverlappingLeaveRequests = (
  employeeId: string,
  startDate: string,
  endDate: string,
  currentRequestId?: string
): boolean => {
  // Convert dates to timestamps for easier comparison
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  return MOCK_EXISTING_LEAVE_REQUESTS.some((request) => {
    // Skip the current request being edited
    if (currentRequestId && request.id === currentRequestId) return false;

    // Skip if the request is cancelled
    if (request.cancelled) return false;

    // Check for overlap
    const requestStart = new Date(request.startDate).getTime();
    const requestEnd = new Date(request.endDate).getTime();

    return start <= requestEnd && end >= requestStart;
  });
};

export const leaveRequestSchema = z
  .object({
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    leaveTypeId: z.string().min(1, 'Leave type is required'),
    requestComments: z.string().optional(),
    requestingEmployeeId: z.string().optional(),
    halfDay: z.boolean().optional(),
    halfDayPart: z.enum(['Morning', 'Afternoon']).optional(),
    attachments: z.array(z.any()).optional(),
    returnDate: z.string().optional(),
    emergencyContact: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    substituteEmployeeId: z.string().optional(),
  })
  .refine(dateRangeValidator('startDate', 'endDate'), {
    message: validationMessages.dateRange,
    path: ['endDate'],
  })
  .refine(
    (data) => {
      if (!data.startDate) return true;
      const startDate = new Date(data.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return startDate >= today;
    },
    {
      message: 'Leave cannot start in the past',
      path: ['startDate'],
    }
  )
  .refine(
    (data) => {
      if (!data.startDate) return true;

      // Validate request is submitted at least 3 days before start date (for planned leave)
      // Except for sick leave and bereavement leave which can be immediate
      if (data.leaveTypeId === 'sick-leave' || data.leaveTypeId === 'bereavement-leave') {
        return true;
      }

      const startDate = new Date(data.startDate);
      const today = new Date();
      const daysDifference = Math.ceil(
        (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return daysDifference >= 3;
    },
    {
      message: 'Leave requests must be submitted at least 3 days in advance',
      path: ['startDate'],
    }
  )
  .refine(
    advancedDateRangeValidator('startDate', 'endDate', {
      minDays: 1,
      maxDays: 90, // Maximum continuous leave period
      allowWeekends: false, // Don't count weekends in leave days
      allowHolidays: false, // Don't count holidays in leave days
      holidays: COMPANY_HOLIDAYS,
    }),
    {
      message:
        'Leave duration must be between 1 and 90 working days (excluding weekends and holidays)',
      path: ['endDate'],
    }
  )
  .refine(
    businessRuleValidators.leaveRequestWithinBalance(
      'startDate',
      'endDate',
      'leaveTypeId',
      MOCK_LEAVE_BALANCES
    ),
    {
      message: 'Insufficient leave balance for the selected leave type and duration',
      path: ['leaveTypeId'],
    }
  )
  .refine(
    (data) => {
      // If it's a half day, then start and end date must be the same
      if (data.halfDay && data.startDate !== data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: 'Half day leave must have the same start and end date',
      path: ['halfDay'],
    }
  )
  .refine(
    (data) => {
      // If half day is selected, half day part must be specified
      if (data.halfDay === true && !data.halfDayPart) {
        return false;
      }
      return true;
    },
    {
      message: 'Please specify which part of the day (Morning/Afternoon)',
      path: ['halfDayPart'],
    }
  )
  .refine(
    (data) => {
      // Validate no overlapping leave requests for the same employee
      if (!data.requestingEmployeeId || !data.startDate || !data.endDate) return true;

      return !hasOverlappingLeaveRequests(data.requestingEmployeeId, data.startDate, data.endDate);
    },
    {
      message: 'You already have an overlapping leave request for this period',
      path: ['startDate'],
    }
  )
  .refine(maxConsecutiveLeaveValidator('startDate', 'endDate', 30), {
    message: validationMessages.maxConsecutiveLeave(30),
    path: ['endDate'],
  })
  .refine(
    (data) => {
      // Validate return date is after end date
      if (!data.endDate || !data.returnDate) return true;

      const endDate = new Date(data.endDate);
      const returnDate = new Date(data.returnDate);

      return returnDate > endDate;
    },
    {
      message: 'Return date must be after the end date of leave',
      path: ['returnDate'],
    }
  )
  .refine(
    (data) => {
      // Validate emergency contact information for long leaves
      if (!data.startDate || !data.endDate) return true;

      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      // For leaves longer than 7 days, emergency contact is required
      if (diffDays > 7) {
        if (!data.emergencyContact || !data.emergencyContactPhone) {
          return false;
        }
      }

      return true;
    },
    {
      message: 'Emergency contact information is required for leaves longer than 7 days',
      path: ['emergencyContact'],
    }
  )
  .refine(
    (data) => {
      // Validate substitute employee for key positions
      // This is a placeholder - in a real app, you'd check if the employee is in a key position
      const keyPositions = ['manager', 'team-lead', 'director'];
      const employeePosition = 'regular'; // This would come from API in real app

      if (keyPositions.includes(employeePosition) && !data.substituteEmployeeId) {
        return false;
      }

      return true;
    },
    {
      message: 'Employees in key positions must designate a substitute during leave',
      path: ['substituteEmployeeId'],
    }
  );

// Update leave request schema (for editing existing leave requests)
export const updateLeaveRequestSchema = (leaveRequestId: string) =>
  z
    .object({
      requestingEmployeeId: z.string().min(1, 'Employee is required'),
      startDate: z.string().min(1, 'Start date is required'),
      endDate: z.string().min(1, 'End date is required'),
      leaveTypeId: z.string().min(1, 'Leave type is required'),
      requestComments: z.string().optional(),
      emergencyContact: z.string().optional(),
      handoverNotes: z.string().optional(),
      attachments: z.array(z.string()).optional(),
      halfDay: z.boolean().optional(),
      halfDayPart: z.enum(['Morning', 'Afternoon']).optional(),
    })
    .refine(dateRangeValidator('startDate', 'endDate'), {
      message: validationMessages.dateRange,
      path: ['endDate'],
    })
    .refine(
      (data) => {
        // If it's a half day, then start and end date must be the same
        if (data.halfDay && data.startDate !== data.endDate) {
          return false;
        }
        return true;
      },
      {
        message: 'Half day leave must have the same start and end date',
        path: ['halfDay'],
      }
    )
    .refine(
      (data) => {
        // If half day is selected, half day part must be specified
        if (data.halfDay === true && !data.halfDayPart) {
          return false;
        }
        return true;
      },
      {
        message: 'Please specify which part of the day (Morning/Afternoon)',
        path: ['halfDayPart'],
      }
    )
    .refine(
      (data) => {
        // Validate no overlapping leave requests for the same employee
        if (!data.requestingEmployeeId || !data.startDate || !data.endDate) return true;

        return !hasOverlappingLeaveRequests(
          data.requestingEmployeeId,
          data.startDate,
          data.endDate,
          leaveRequestId
        );
      },
      {
        message:
          'You already have an approved or pending leave request that overlaps with these dates',
        path: ['startDate'],
      }
    );

export type LeaveRequestFormValues = z.infer<typeof leaveRequestSchema>;

export const approveLeaveRequestSchema = z.object({
  approved: z.boolean(),
  comments: z.string().optional(),
  approverNotes: z.string().optional(),
  delegatedTo: z.string().optional(),
});

export type ApproveLeaveRequestFormValues = z.infer<typeof approveLeaveRequestSchema>;

// Schema for leave cancellation
export const cancelLeaveRequestSchema = z.object({
  cancellationReason: z.string().min(1, 'Cancellation reason is required'),
  returnDate: z.string().optional(),
});

export type CancelLeaveRequestFormValues = z.infer<typeof cancelLeaveRequestSchema>;
