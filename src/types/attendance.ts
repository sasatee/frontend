export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  overtimeHours: number;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface AttendanceFormValues {
  employeeId: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  overtimeHours: number;
}
