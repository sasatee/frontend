// @ts-ignore
import { BaseEntity } from './api';

export interface Department {
  id: string;
  departmentName: string;
  headOfDepartment: string;
}

export interface CreateDepartmentDto {
  departmentName: string;
  headOfDepartment: string;
}

export interface UpdateDepartmentDto {
  departmentName: string;
  headOfDepartment: string;
}

// API response wrapper for Department endpoints
export interface DepartmentApiResponse {
  isSuccess: boolean;
  message: string;
  result: Department[];
}

// Single department response
export interface SingleDepartmentApiResponse {
  isSuccess: boolean;
  message: string;
  result: Department;
}
