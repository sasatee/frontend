import axios from '@/lib/axios';

export interface PayrollDto {
  employeeId: string;
  categoryGroupId: string;
  yearOfService: number;
}

export interface PayrollResponse {
  id: string;
  employeeId: string;
  payDate: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  // Additional fields that might be populated by frontend
  employeeName?: string;
  categoryGroupId?: string;
  categoryGroupName?: string;
  yearOfService?: number;
}

export interface PayrollCalculationRequest {
  employeeId: string;
  categoryGroupId: string;
}

export const payrollService = {
  /**
   * Calculate payroll for a specific employee (Admin function)
   * This matches the API endpoint: POST /api/Payroll/{employeeId}?categoryGroupId={categoryGroupId}
   */
  calculatePayroll: async (data: PayrollCalculationRequest): Promise<PayrollResponse> => {
    const { employeeId, categoryGroupId } = data;

    // Validate required fields
    if (!employeeId || !categoryGroupId) {
      throw new Error('Employee ID and Category Group ID are required for payroll calculation');
    }

    console.log('🔄 Calculating Payroll:');
    console.log('  Employee ID:', employeeId);
    console.log('  Category Group ID:', categoryGroupId);
    console.log('  API Endpoint:', `/api/Payroll/${employeeId}?categoryGroupId=${categoryGroupId}`);

    try {
      const response = await axios.post(
        `/api/Payroll/${employeeId}?categoryGroupId=${categoryGroupId}`,
        {} // Empty body as per API specification
      );

      console.log('✅ Payroll calculation successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Payroll calculation failed:', error.response?.data || error.message);

      // Provide more specific error messages
      if (error.response?.status === 404) {
        throw new Error('Employee or category group not found');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid request data. Please check employee and category group information.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Only administrators can calculate payroll.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error during payroll calculation. Please try again.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to calculate payroll');
      }
    }
  },

  createPayroll: async (data: PayrollDto): Promise<PayrollResponse> => {
    // Extract employeeId for path parameter and send only the required fields in body
    const { employeeId, yearOfService, categoryGroupId } = data;

    // Ensure yearOfService is a number and validate required fields
    if (!employeeId || !categoryGroupId) {
      throw new Error('Employee ID and Category Group ID are required');
    }

    const numericYearOfService = Number(yearOfService);
    if (isNaN(numericYearOfService) || numericYearOfService < 0) {
      throw new Error('Years of service must be a valid number');
    }

    // Map to API expected field names (PascalCase) - try different variations
    const payrollData = {
      categoryGroupId: categoryGroupId.toString(), // Try camelCase first
      yearOfService: numericYearOfService,
    };

    // Also try PascalCase version
    const payrollDataPascal = {
      CategoryGroupId: categoryGroupId.toString(),
      YearOfService: numericYearOfService,
    };

    // Try query parameter version
    const payrollDataQuery = {
      categoryGroupId: categoryGroupId.toString(),
      YearOfService: numericYearOfService,
    };

    console.log('Payroll API Request:');
    console.log('URL:', `/api/Payroll/${employeeId}`);
    console.log('Payload (PascalCase):', JSON.stringify(payrollDataPascal, null, 2));
    console.log('Original data:', JSON.stringify(data, null, 2));

    try {
      // Try as query parameters first
      const response = await axios.post(
        `/api/Payroll/${employeeId}?categoryGroupId=${categoryGroupId}&YearOfService=${numericYearOfService}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Payroll API Error (Query Params):', error.response?.data || error.message);

      // If query params fail, try with request body
      try {
        console.log('Trying with request body...');
        const response = await axios.post(`/api/Payroll/${employeeId}`, payrollDataPascal);
        return response.data;
      } catch (bodyError: any) {
        console.error(
          'Payroll API Error (Request Body):',
          bodyError.response?.data || bodyError.message
        );
        if (bodyError.response?.data) {
          console.error('Error details:', JSON.stringify(bodyError.response.data, null, 2));
        }
        throw bodyError;
      }
    }
  },

  getPayroll: async (id: string): Promise<PayrollResponse> => {
    const response = await axios.get(`/api/Payroll/${id}`);
    return response.data;
  },

  getAllPayrolls: async (): Promise<PayrollResponse[]> => {
    const response = await axios.get('/api/Payroll');
    console.log('Get all payrolls response:', response.data);

    let payrolls: PayrollResponse[] = [];

    // Handle the response structure based on API documentation
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      payrolls = response.data.data;
    } else if (Array.isArray(response.data)) {
      payrolls = response.data;
    }

    // Note: Employee enrichment is now handled by usePayrollWithEmployees hook

    return payrolls;
  },

  deletePayroll: async (id: string): Promise<void> => {
    await axios.delete(`/api/Payroll/${id}`);
  },

  getTotalDeductions: async (employeeId: string): Promise<number> => {
    const response = await axios.get(`/api/Payroll/deductions/total/${employeeId}`);
    return response.data;
  },

  getTotalAllowances: async (employeeId: string): Promise<number> => {
    const response = await axios.get(`/api/Payroll/allowance/total/${employeeId}`);
    return response.data;
  },
};
