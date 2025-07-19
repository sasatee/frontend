export interface CategoryGroup {
  id: string;
  name: string;
  description?: string;
  code?: string;
  baseSalary?: number;
  grade?: string;
  level?: number;
  isActive?: boolean;
}

export interface SalaryStep {
  id: string;
  increment: number;
  toAmount: number;
  fromAmount: number;
  categoryGroupId: string;
}

export interface CreateCategoryGroupDto {
  name: string;
}

export interface UpdateCategoryGroupDto {
  name: string;
}

export interface SalaryProgressionResponse {
  id: string;
  name: string;
  count: number;
  employeeData: any[];
  salarySteps: SalaryStep[];
}
