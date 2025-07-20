// @ts-ignore
import { Employee } from './employee';
import { CategoryGroup } from './categoryGroup';

export interface Allowance {
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
    categoryGroup?: {
      id: string;
      name: string;
      employees: string[];
      salarySteps: {
        id: string;
        fromAmount: number;
        increment: number;
        toAmount: number;
        categoryGroupId: string;
        categoryGroup: string;
      }[];
    };
  } | null;
}

export interface CreateAllowanceDto {
  typeName: string;
  description: string;
  effectiveDate: string;
  remarks: string;
  employeeId: string;
  amount: number;
}

export interface UpdateAllowanceDto {
  typeName: string;
  description: string;
  effectiveDate: string;
  remarks: string;
  employeeId: string;
  amount: number;
}

export interface CreateManyAllowancesDto {
  employeeId: string;
  allowances: CreateAllowanceDto[];
}
