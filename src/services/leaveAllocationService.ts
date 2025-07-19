import axios from '../lib/axios';
import { showErrorToast } from '../lib/error-handler';
import { LeaveAllocation, LeaveAllocationPayload } from '../types/leaveAllocation';

const BASE_URL = '/api/LeaveAllocation';

// Types for leave balance responses
export interface LeaveBalance {
  leaveTypeId: string;
  leaveTypeName: string;
  allocatedDays: number;
  usedDays: number;
  remainingDays: number;
  period: number;
}

export interface LeaveBalanceSummary {
  employeeId: string;
  period: number;
  balances: LeaveBalance[];
  totalAllocated: number;
  totalUsed: number;
  totalRemaining: number;
}

export const getAllLeaveAllocations = async (): Promise<LeaveAllocation[]> => {
  const { data } = await axios.get(BASE_URL);
  return data;
};

export const getLeaveAllocationById = async (id: string): Promise<LeaveAllocation> => {
  const { data } = await axios.get(`${BASE_URL}/${id}`);
  return data;
};

export const createLeaveAllocation = async (
  payload: LeaveAllocationPayload
): Promise<LeaveAllocation> => {
  try {
    const { data } = await axios.post<LeaveAllocation>(`${BASE_URL}/create-for-year`, payload);

    if (!data) {
      throw new Error('No data received from server');
    }

    return data;
  } catch (error: any) {
    // Handle validation errors
    if (error.response?.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
      throw new Error(errorMessages);
    }

    // Handle error message in response data
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    // Handle other errors
    showErrorToast(error, 'creating leave allocation');
    throw new Error('Failed to create leave allocation');
  }
};

export const deleteLeaveAllocation = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}`);
};

export const getLeaveBalance = async (
  employeeId: string,
  period: number,
  leaveTypeId?: string
): Promise<LeaveBalance | LeaveBalanceSummary> => {
  try {
    let url = `${BASE_URL}/balance/${employeeId}`;
    if (leaveTypeId) {
      url += `/${leaveTypeId}`;
    }
    url += `/${period}`;

    console.log('Fetching leave balance from URL:', url);
    const { data } = await axios.get(url);

    console.log('Leave balance API response:', data);

    if (!data) {
      throw new Error('No balance data received from server');
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching leave balance:', error);

    // Handle validation errors
    if (error.response?.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
      throw new Error(errorMessages);
    }

    // Handle error message in response data
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    // Handle other errors
    showErrorToast(error, 'fetching leave balance');
    throw new Error('Failed to fetch leave balance');
  }
};
