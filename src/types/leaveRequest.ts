export interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  requestComments?: string;
  approved: boolean | null;
  cancelled: boolean;
  requestingEmployeeId: string;
  approvedById?: string | null;
  leaveTypeId: string;
  leaveTypeName?: string;
}

export interface CreateLeaveRequestDto {
  startDate: string;
  endDate: string;
  leaveTypeId: string;
  requestComments: string;
  requestingEmployeeId: string;
}

export interface UpdateLeaveRequestDto {
  startDate: string;
  endDate: string;
  leaveTypeId: string;
  requestComments?: string;
}

export interface ApproveLeaveRequestDto {
  approved: boolean;
}
