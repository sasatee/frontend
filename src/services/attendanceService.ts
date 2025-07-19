import axios from '@/lib/axios';
import { retryOperation, showErrorToast } from '@/lib/error-handler';
import { sanitizeObject } from '@/lib/utils';
import { Attendance } from '@/types/attendance';

export interface AttendanceDTO {
  employeeId: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  overtimeHours: number;
}

export class AttendanceService {
  private readonly headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  async getAttendances(): Promise<Attendance[]> {
    try {
      return await retryOperation(
        async () => {
          const response = await axios.get<Attendance[]>('/api/Attendance', {
            headers: this.headers,
          });
          return response.data || [];
        },
        2,
        1000,
        'fetching attendances'
      );
    } catch (error) {
      showErrorToast(error, 'fetching attendances');
      return [];
    }
  }

  async getAttendanceById(id: string): Promise<Attendance> {
    try {
      const response = await axios.get<Attendance>(`/api/Attendance/${id}`, {
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      showErrorToast(error, `fetching attendance ${id}`);
      throw new Error('Failed to fetch attendance record');
    }
  }

  /**
   * Get attendance records for a specific employee
   * @param employeeId The employee ID to fetch attendance for
   * @param month Optional month filter (YYYY-MM format)
   * @returns Promise<Attendance[]> Array of attendance records
   */
  async getEmployeeAttendance(employeeId: string, month?: string): Promise<Attendance[]> {
    try {
      let url = `/api/Attendance/employee/${employeeId}`;

      // Add month query parameter if provided
      if (month) {
        url += `?month=${month}`;
      }

      console.log('🔄 Fetching employee attendance:', { employeeId, month, url });

      const response = await axios.get<Attendance[]>(url, {
        headers: this.headers,
      });

      console.log('✅ Employee attendance response:', response.data);
      return response.data || [];
    } catch (error: any) {
      console.error('❌ Employee attendance fetch failed:', error.response?.data || error.message);

      // Provide specific error messages
      if (error.response?.status === 404) {
        throw new Error('Employee not found or no attendance records available');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You can only view your own attendance records.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error while fetching attendance records. Please try again.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to fetch attendance records');
      }
    }
  }

  async createAttendance(data: AttendanceDTO): Promise<Attendance> {
    try {
      // Format time strings to ensure HH:mm:ss format
      const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
      };

      // Convert date to ISO format
      const dateObj = new Date(data.date);
      dateObj.setHours(0, 0, 0, 0);
      const isoDate = dateObj.toISOString();

      // Sanitize and format input data (removed status field)
      const sanitizedData = sanitizeObject({
        employeeId: data.employeeId,
        date: isoDate,
        checkInTime: formatTime(data.checkInTime),
        checkOutTime: formatTime(data.checkOutTime),
        overtimeHours: Number(data.overtimeHours),
      });

      console.log('Sending attendance data:', sanitizedData);

      const response = await axios.post<Attendance>('/api/Attendance', sanitizedData, {
        headers: this.headers,
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      return response.data;
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid attendance data');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error while creating attendance. Please try again.');
      }

      throw new Error(error.message || 'Failed to create attendance');
    }
  }

  async updateAttendance(id: string, data: Partial<AttendanceDTO>): Promise<Attendance> {
    try {
      // Format time strings if provided
      const formatTime = (time?: string) => {
        if (!time) return undefined;
        const [hours, minutes] = time.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
      };

      // Convert date to ISO format if provided
      let isoDate: string | undefined;
      if (data.date) {
        const dateObj = new Date(data.date);
        dateObj.setHours(0, 0, 0, 0);
        isoDate = dateObj.toISOString();
      }

      // Sanitize input data (removed status field)
      const sanitizedData = sanitizeObject({
        employeeId: data.employeeId,
        date: isoDate,
        checkInTime: data.checkInTime ? formatTime(data.checkInTime) : undefined,
        checkOutTime: data.checkOutTime ? formatTime(data.checkOutTime) : undefined,
        overtimeHours: data.overtimeHours !== undefined ? Number(data.overtimeHours) : undefined,
      });

      console.log('Sending updated attendance data:', sanitizedData);

      const response = await axios.put<any>(`/api/Attendance/${id}`, sanitizedData, {
        headers: this.headers,
      });

      console.log('Server response:', response);

      // If we get a 204 No Content, fetch the updated record
      if (response.status === 204) {
        return await this.getAttendanceById(id);
      }

      // If we have data in the response
      if (response.data) {
        // If response has success flag
        if (response.data.success !== undefined) {
          if (response.data.success === false) {
            throw new Error(response.data.message || 'Failed to update attendance');
          }
          return response.data.data || response.data;
        }

        // If response has result property
        if (response.data.result) {
          return response.data.result;
        }

        // If response data is the attendance object itself
        if (typeof response.data === 'object' && !Array.isArray(response.data)) {
          return response.data;
        }
      }

      // If we get here, try to fetch the updated record
      try {
        return await this.getAttendanceById(id);
      } catch (fetchError) {
        throw new Error('Attendance updated but failed to fetch updated record');
      }
    } catch (error: any) {
      console.error('Error updating attendance:', error);
      throw new Error(error.message || 'Failed to update attendance');
    }
  }

  async deleteAttendance(id: string): Promise<void> {
    try {
      await axios.delete(`/api/Attendance/${id}`, {
        headers: this.headers,
      });
    } catch (error: any) {
      showErrorToast(error, 'deleting attendance');
      throw new Error('Failed to delete attendance');
    }
  }
}

const attendanceService = new AttendanceService();

export const getAttendances = () => attendanceService.getAttendances();
export const getAttendanceById = (id: string) => attendanceService.getAttendanceById(id);
export const getEmployeeAttendance = (employeeId: string, month?: string) =>
  attendanceService.getEmployeeAttendance(employeeId, month);
export const createAttendance = (data: AttendanceDTO) => attendanceService.createAttendance(data);
export const updateAttendance = (id: string, data: Partial<AttendanceDTO>) =>
  attendanceService.updateAttendance(id, data);
export const deleteAttendance = (id: string) => attendanceService.deleteAttendance(id);
