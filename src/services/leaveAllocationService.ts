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
    console.log('Employee ID:', employeeId);
    console.log('Period:', period);
    console.log('Leave Type ID:', leaveTypeId);

    const { data } = await axios.get(url);

    console.log('Leave balance API response:', data);
    console.log('Response type:', typeof data);
    console.log('Is array:', Array.isArray(data));

    if (!data) {
      throw new Error('No balance data received from server');
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching leave balance:', error);
    console.error('Error response:', error.response);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);

    // Handle specific HTTP status codes
    if (error.response?.status === 404) {
      throw new Error('No leave allocation found');
    }
    
    if (error.response?.status === 403) {
      throw new Error('Access denied');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Unauthorized');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Server error');
    }

    // Handle validation errors
    if (error.response?.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
      throw new Error(errorMessages);
    }

    // Handle error message in response data
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      throw new Error('Network error');
    }

    // Handle other errors
    showErrorToast(error, 'fetching leave balance');
    throw new Error('Failed to fetch leave balance');
  }
};
