import { usePaginatedData } from './usePaginatedData';
import { Employee } from '@/types/employee';
import { employeeService, CreateEmployeeDto, UpdateEmployeeDto } from '@/services/employeeService';
import { getCacheConfig } from '@/lib/cache-config';

interface UpdateEmployeeInput {
  id: string;
  data: UpdateEmployeeDto;
}

export const useEmployees = (initialParams = {}) => {
  const { staleTime, cacheTime } = getCacheConfig('EMPLOYEE');

  return usePaginatedData<Employee, CreateEmployeeDto, UpdateEmployeeInput>({
    queryKey: 'employees',
    fetchFn: employeeService.getAllEmployees.bind(employeeService),
    createFn: (data) => employeeService.createEmployee(data),
    updateFn: (data) => employeeService.updateEmployee(data.id, data.data),
    deleteFn: employeeService.deleteEmployee.bind(employeeService),
    idField: 'id',
    initialParams: {
      sortBy: 'firstName',
      sortDirection: 'asc',
      ...initialParams,
    },
    staleTime,
    cacheTime,
  });
};
