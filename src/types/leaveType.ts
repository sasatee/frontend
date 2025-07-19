export interface LeaveType {
  id: string;
  name: string;
  defaultDays: number;
}

export interface CreateLeaveTypeDto {
  name: string;
  defaultDays: number;
}
