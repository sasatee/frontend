import axios from './axios';
import { showErrorToast, retryOperation } from './error-handler';
import { ApiResponse, BaseEntity, QueryParams } from '@/types/api';
import { DEFAULT_RETRY_COUNT, DEFAULT_RETRY_DELAY } from './constants';

export abstract class BaseService {
  protected readonly headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  protected abstract readonly baseUrl: string;

  protected async get<T extends BaseEntity>(
    url: string,
    errorContext: string,
    params?: QueryParams
  ): Promise<T[]> {
    try {
      return await retryOperation(
        async () => {
          const response = await axios.get<ApiResponse<T>>(url, {
            headers: this.headers,
            params,
          });

          return this.unwrapResponse(response.data);
        },
        DEFAULT_RETRY_COUNT,
        DEFAULT_RETRY_DELAY,
        errorContext
      );
    } catch (error) {
      showErrorToast(error, errorContext);
      return [];
    }
  }

  protected async getById<T extends BaseEntity>(
    url: string,
    errorContext: string
  ): Promise<T | null> {
    try {
      const response = await axios.get<ApiResponse<T>>(url, {
        headers: this.headers,
      });

      const unwrapped = this.unwrapResponse(response.data);
      return Array.isArray(unwrapped) ? unwrapped[0] : unwrapped;
    } catch (error) {
      showErrorToast(error, errorContext);
      return null;
    }
  }

  protected async post<TDto, TResponse extends BaseEntity>(
    url: string,
    data: TDto,
    errorContext: string
  ): Promise<TResponse> {
    try {
      const response = await axios.post<ApiResponse<TResponse>>(url, data, {
        headers: this.headers,
      });

      const unwrapped = this.unwrapResponse(response.data);
      if (!unwrapped.length) {
        throw new Error(`Failed to ${errorContext}`);
      }
      return unwrapped[0];
    } catch (error) {
      showErrorToast(error, errorContext);
      throw error;
    }
  }

  protected async put<TDto, TResponse extends BaseEntity>(
    url: string,
    data: TDto,
    errorContext: string
  ): Promise<TResponse> {
    try {
      const response = await axios.put<ApiResponse<TResponse>>(url, data, {
        headers: this.headers,
      });

      const unwrapped = this.unwrapResponse(response.data);
      if (!unwrapped.length) {
        throw new Error(`Failed to ${errorContext}`);
      }
      return unwrapped[0];
    } catch (error) {
      showErrorToast(error, errorContext);
      throw error;
    }
  }

  protected async delete(url: string, errorContext: string): Promise<void> {
    try {
      await axios.delete(url, {
        headers: this.headers,
      });
    } catch (error) {
      showErrorToast(error, errorContext);
      throw error;
    }
  }

  private unwrapResponse<T>(response: ApiResponse<T> | T[] | T): T[] {
    if (!response) {
      return [];
    }

    // Handle direct array response
    if (Array.isArray(response)) {
      return response;
    }

    // Handle object response
    if (typeof response === 'object') {
      // Check for result property
      if ('result' in response && response.result !== undefined) {
        return Array.isArray(response.result) ? response.result : [response.result];
      }

      // Check for data property
      if ('data' in response && response.data !== undefined) {
        return Array.isArray(response.data) ? response.data : [response.data];
      }

      // If response is a single object (not ApiResponse), wrap it in array
      if (!('isSuccess' in response) && !('message' in response)) {
        return [response as T];
      }
    }

    return [];
  }
}
