import axios from '@/lib/axios';
import { Deduction, CreateDeductionDto, UpdateDeductionDto } from '@/types/deduction';
import { showErrorToast } from '@/lib/error-handler';
import { sanitizeObject } from '@/lib/utils';

export const getDeductions = async (): Promise<Deduction[]> => {
  try {
    const response = await axios.get<Deduction[]>('/api/Deduction');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    showErrorToast(error, 'fetching deductions');
    return [];
  }
};

export const getDeduction = async (id: string): Promise<Deduction> => {
  try {
    const response = await axios.get<Deduction>(`/api/Deduction/${id}`);
    return response.data;
  } catch (error) {
    showErrorToast(error, `fetching deduction ${id}`);
    throw error;
  }
};

export const getDeductionsByEmployee = async (employeeId: string): Promise<Deduction[]> => {
  try {
    const response = await axios.get<Deduction[]>(`/api/Deduction/GetDeductionWith/${employeeId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    showErrorToast(error, `fetching deductions for employee ${employeeId}`);
    return [];
  }
};

export const createDeduction = async (deduction: CreateDeductionDto): Promise<Deduction> => {
  try {
    const payload = sanitizeObject({
      typeName: deduction.typeName,
      amount: Number(deduction.amount),
      employeeId: deduction.employeeId,
      remarks: deduction.remarks || '',
    });

    const response = await axios.post<Deduction>('/api/Deduction', payload);
    return response.data;
  } catch (error) {
    showErrorToast(error, 'creating deduction');
    throw error;
  }
};

export const updateDeduction = async (
  id: string,
  deduction: UpdateDeductionDto
): Promise<Deduction> => {
  try {
    const payload = sanitizeObject({
      typeName: deduction.typeName,
      amount: Number(deduction.amount),
      employeeId: deduction.employeeId,
      remarks: deduction.remarks || '',
    });

    const response = await axios.put<Deduction>(`/api/Deduction/${id}`, payload);
    return response.data;
  } catch (error) {
    showErrorToast(error, `updating deduction ${id}`);
    throw error;
  }
};

export const deleteDeduction = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/api/Deduction/${id}`);
  } catch (error) {
    showErrorToast(error, `deleting deduction ${id}`);
    throw error;
  }
};
