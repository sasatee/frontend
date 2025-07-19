import { LeaveRequest } from '@/types/leaveRequest';

// Mock departments for testing
export const MOCK_DEPARTMENTS = [
  { id: '1', name: 'Engineering' },
  { id: '2', name: 'Marketing' },
  { id: '3', name: 'Human Resources' },
  { id: '4', name: 'Finance' },
] as const;

// Mock job titles for testing
export const MOCK_JOB_TITLES = [
  { id: '1', name: 'Software Engineer' },
  { id: '2', name: 'Senior Developer' },
  { id: '3', name: 'Project Manager' },
  { id: '4', name: 'UX Designer' },
] as const;

// Mock holidays for validation (in a real app, this would come from an API)
export const COMPANY_HOLIDAYS = [
  '2023-12-25',
  '2023-12-26',
  '2024-01-01',
  '2024-01-15',
  '2024-02-19',
  '2024-05-27',
  '2024-06-19',
  '2024-07-04',
  '2024-09-02',
  '2024-11-11',
  '2024-11-28',
  '2024-12-25',
];

// Mock leave balances (in a real app, this would come from an API)
export const MOCK_LEAVE_BALANCES: Record<string, number> = {
  'annual-leave': 20,
  'sick-leave': 10,
  'casual-leave': 7,
  'maternity-leave': 90,
  'paternity-leave': 14,
  'bereavement-leave': 5,
  'unpaid-leave': 30,
};

// Mock existing leave requests (in a real app, this would come from an API)
export const MOCK_EXISTING_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: '1',
    startDate: '2024-06-15',
    endDate: '2024-06-30',
    leaveTypeId: 'annual-leave',
    leaveTypeName: 'Annual Leave',
    approved: true,
    cancelled: false,
  },
  {
    id: '2',
    startDate: '2024-07-01',
    endDate: '2024-07-10',
    leaveTypeId: 'annual-leave',
    leaveTypeName: 'Annual Leave',
    approved: true,
    cancelled: false,
  },
  {
    id: '3',
    startDate: '2024-08-15',
    endDate: '2024-08-20',
    leaveTypeId: 'annual-leave',
    leaveTypeName: 'Annual Leave',
    approved: false,
    cancelled: false,
  },
];
