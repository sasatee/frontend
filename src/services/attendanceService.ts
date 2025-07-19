import axios from '@/lib/axios';
import { Attendance } from '@/types/attendance';
import { showErrorToast, retryOperation } from '@/lib/error-handler';
import { sanitizeObject } from '@/lib/utils';

export interface AttendanceDTO {
  employeeId: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  overtimeHours: number;
  status?: string;
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
      const errorDetails = showErrorToast(error, `fetching attendance ${id}`);
      throw new Error(errorDetails.message);
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

      // Sanitize and format input data
      const sanitizedData = sanitizeObject({
        employeeId: data.employeeId,
        date: isoDate,
        checkInTime: formatTime(data.checkInTime),
        checkOutTime: formatTime(data.checkOutTime),
        overtimeHours: Number(data.overtimeHours),
        status: data.status || 'Present',
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

      // Sanitize input data
      const sanitizedData = sanitizeObject({
        employeeId: data.employeeId,
        date: isoDate,
        checkInTime: data.checkInTime ? formatTime(data.checkInTime) : undefined,
        checkOutTime: data.checkOutTime ? formatTime(data.checkOutTime) : undefined,
        overtimeHours: data.overtimeHours !== undefined ? Number(data.overtimeHours) : undefined,
        status: data.status,
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
        console.error('Failed to fetch updated attendance:', fetchError);
        throw new Error('Update succeeded but failed to fetch updated record');
      }
    } catch (error: any) {
      console.error('Update error details:', error.response?.data || error);

      if (error.response?.status === 400) {
        const message =
          error.response.data?.message || error.response.data || 'Invalid attendance data';
        throw new Error(message);
      }
      if (error.response?.status === 404) {
        throw new Error('Attendance record not found');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error while updating attendance. Please try again.');
      }
      throw new Error(error.message || 'Failed to update attendance');
    }
  }

  async deleteAttendance(id: string): Promise<void> {
    try {
      await axios.delete(`/api/Attendance/${id}`, {
        headers: this.headers,
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Attendance record not found');
      }
      throw new Error(error.message || 'Failed to delete attendance');
    }
  }
}

export const attendanceService = new AttendanceService();

// Export functions for direct use
export const getAttendances = () => attendanceService.getAttendances();
export const getAttendanceById = (id: string) => attendanceService.getAttendanceById(id);
export const createAttendance = (data: AttendanceDTO) => attendanceService.createAttendance(data);
export const updateAttendance = (id: string, data: Partial<AttendanceDTO>) =>
  attendanceService.updateAttendance(id, data);
export const deleteAttendance = (id: string) => attendanceService.deleteAttendance(id);
