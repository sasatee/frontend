import axios from '@/lib/axios';
import { showErrorToast, retryOperation, getErrorMessage } from '@/lib/error-handler';
import { sanitizeObject } from '@/lib/utils';
import {
  Allowance,
  CreateAllowanceDto,
  UpdateAllowanceDto,
  CreateManyAllowancesDto,
} from '@/types/allowance';

export const getAllAllowances = async (): Promise<Allowance[]> => {
  try {
    return await retryOperation(
      async () => {
        const response = await axios.get<Allowance[]>('/api/Allowance');

        // Check if the response exists
        if (!response.data) {
          return [];
        }

        // Handle array response directly
        if (Array.isArray(response.data)) {
          return response.data;
        }

        // Return empty array as fallback
        return [];
      },
      2,
      1000,
      'fetching allowances'
    );
  } catch (error) {
    showErrorToast(error, 'fetching allowances');
    return [];
  }
};

export const getAllowanceById = async (id: string): Promise<Allowance> => {
  try {
    const response = await axios.get<Allowance>(`/api/Allowance/${id}`);
    return response.data;
  } catch (error) {
    showErrorToast(error, `fetching allowance ${id}`);
    throw new Error(getErrorMessage(error, `fetching allowance ${id}`));
  }
};

export const createAllowance = async (allowance: CreateAllowanceDto): Promise<Allowance> => {
  try {
    // Sanitize input data
    const sanitizedData = sanitizeObject(allowance);
    const response = await axios.post<Allowance>('/api/Allowance', sanitizedData);
    return response.data;
  } catch (error) {
    showErrorToast(error, 'creating allowance');
    throw new Error(getErrorMessage(error, 'creating allowance'));
  }
};

export const updateAllowance = async (
  id: string,
  allowance: UpdateAllowanceDto
): Promise<Allowance> => {
  try {
    // Sanitize input data
    const sanitizedData = sanitizeObject(allowance);
    const response = await axios.put<Allowance>(`/api/Allowance/${id}`, sanitizedData);
    return response.data;
  } catch (error) {
    showErrorToast(error, 'updating allowance');
    throw new Error(getErrorMessage(error, 'updating allowance'));
  }
};

export const deleteAllowance = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/api/Allowance/${id}`);
  } catch (error) {
    showErrorToast(error, 'deleting allowance');
    throw new Error(getErrorMessage(error, 'deleting allowance'));
  }
};

export const getAllowancesByEmployeeId = async (employeeId: string): Promise<Allowance[]> => {
  try {
    const response = await axios.get<Allowance[]>(`/api/Allowance/GetAllowanceWith/${employeeId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    showErrorToast(error, `fetching allowances for employee ${employeeId}`);
    return [];
  }
};

export const createManyAllowances = async (
  employeeId: string,
  allowances: Omit<CreateAllowanceDto, 'employeeId'>[]
): Promise<Allowance[]> => {
  try {
    if (!allowances || !allowances.length) {
      return [];
    }

    const sanitizedAllowances = sanitizeObject(allowances);
    const payload: CreateManyAllowancesDto = {
      employeeId,
      allowances: sanitizedAllowances.map((item) => ({
        ...item,
        employeeId,
      })),
    };

    const response = await axios.post<Allowance[]>(
      '/api/Allowance/create/many/allowances',
      payload
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    showErrorToast(error, 'creating multiple allowances');
    throw new Error(getErrorMessage(error, 'creating multiple allowances'));
  }
};
