export interface Deduction {
  id: string;
  typeName: string;
  description: string;
  effectiveDate: string;
  remarks: string;
  amount: number;
  modifiedAt: string;
  employeeId: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    dateOfJoining: string;
    dateOfLeaving: string;
    departmentId: string;
    jobTitleId: string;
    appUserId: string;
    nic: string;
    yearsOfService: number;
    currentSalary: number;
    categoryGroupId: string;
  } | null;
}

export interface CreateDeductionDto {
  typeName: string;
  amount: number;
  employeeId: string;
  remarks: string;
}

export interface UpdateDeductionDto {
  typeName: string;
  amount: number;
  employeeId: string;
  remarks: string;
}

export interface DeductionFormValues {
  typeName: string;
  description: string;
  amount: number;
  employeeId: string;
  remarks: string;
}
