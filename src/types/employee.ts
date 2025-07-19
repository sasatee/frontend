export interface Employee {
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
  categoryGroupId: string | null;
  gender: 'Male' | 'Female' | 'Other'; // Must be exactly "Male", "Female", or "Other"
  department?: any;
  jobTitle?: any;
  categoryGroup?: any;
  salary: number;
  allowances: number;
  deductions: number;
}

export interface EmployeeFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  jobTitleId: string;
  departmentId: string;
  categoryGroupId?: string;
  nic?: string;
  dateOfJoining?: Date;
  gender?: 'Male' | 'Female' | 'Other'; // UI representation
  yearsOfService?: number;
  postalCode?: string;
  city?: string;
  country?: string;
}

export interface EmployeeDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  jobTitleId: string;
  departmentId: string;
  dateOfJoining?: string;
  gender?: 'Male' | 'Female' | 'Other';
  nic?: string;
  yearsOfService?: number;
  categoryGroupId?: string;
}
