// @ts-ignore
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// In development, we use the proxy from Vite config
const isDevelopment = import.meta.env.DEV;

// Get the base URL from environment
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

// Set the baseURL appropriately
let baseURL;

if (isDevelopment) {
  // In development, API calls already have /api in their paths
  baseURL = '';
} else {
  // For production, use the full URL from the environment variable
  baseURL = apiBaseUrl;
}

// Create a request queue to throttle requests
const requestQueue: (() => void)[] = [];
const MAX_CONCURRENT_REQUESTS = 2;
let activeRequests = 0;

// Process the next request in the queue
const processNextRequest = () => {
  if (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
    const nextRequest = requestQueue.shift();
    if (nextRequest) {
      activeRequests++;
      nextRequest();
    }
  }
};

// Add request to queue
const enqueueRequest = (requestFn: () => void): Promise<void> => {
  return new Promise((resolve) => {
    const wrappedRequest = () => {
      requestFn();
      resolve();
    };
    requestQueue.push(wrappedRequest);
    processNextRequest();
  });
};

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Set a reasonable timeout
  timeout: 10000,
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
// Queue of requests that should be retried after token refresh
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void }[] = [];

// Process the queue of failed requests
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add a request interceptor to add auth token and throttle requests
axiosInstance.interceptors.request.use(
  async (config) => {
    // Add request to queue if we're over the limit
    if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
      await enqueueRequest(() => {});
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add cache-busting headers to prevent browser caching
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';

    // Add a timestamp parameter to URLs for GET requests to prevent caching
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: new Date().getTime(),
      };
    }

    // Add a default timeout if not set
    if (!config.timeout) {
      config.timeout = 10000; // 10 seconds
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors and manage the request queue
axiosInstance.interceptors.response.use(
  (response) => {
    // Decrement active requests and process next in queue
    activeRequests = Math.max(0, activeRequests - 1);
    processNextRequest();

    // Log successful responses for debugging
    if (response.config.url?.includes('/api/JobTitle')) {
      console.log(`API Response from ${response.config.url}:`, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
      });

      // If data is an array, log the structure of the first item
      if (Array.isArray(response.data) && response.data.length > 0) {
        const firstItem = response.data[0];
        console.log('First item structure:', {
          properties: Object.keys(firstItem),
          hasBaseSalary: 'baseSalary' in firstItem,
          baseSalaryType: typeof firstItem.baseSalary,
          baseSalaryValue: firstItem.baseSalary,
          hasGrade: 'grade' in firstItem,
          gradeType: typeof firstItem.grade,
          gradeValue: firstItem.grade,
        });
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    // Decrement active requests and process next in queue
    activeRequests = Math.max(0, activeRequests - 1);
    processNextRequest();

    // Handle specific error types
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out:', error.config?.url);
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Network error:', error.config?.url);
    } else if (error.code === 'ERR_INSUFFICIENT_RESOURCES') {
      console.error('Insufficient resources error:', error.config?.url);
      // Wait a bit before allowing more requests
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors with token refresh logic
    if (error.response?.status === 401 && !originalRequest._retry) {
          // Skip refresh token for login endpoint
    if (originalRequest.url?.includes('/login')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, add request to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to get refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call the refresh token endpoint
        const response = await axios.post(`${baseURL}/api/Account/refresh-token`, {
          refreshToken,
        });

        // Check if the refresh was successful
        let newToken = '';
        let newRefreshToken = '';

        if (response.data) {
          if (response.data.token) {
            newToken = response.data.token;
            newRefreshToken = response.data.refreshToken || refreshToken;
          } else if (response.data.result && response.data.result.token) {
            newToken = response.data.result.token;
            newRefreshToken = response.data.result.refreshToken || refreshToken;
          }
        }

        if (!newToken) {
          throw new Error('Failed to refresh token');
        }

        // Store new tokens
        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Update Authorization header
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        // Process any queued requests
        processQueue(null, newToken);

        // Retry the original request with new token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Process queued requests with error
        processQueue(refreshError as Error);

        // Clear auth data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');

        // Only redirect to login if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          // Store the current path to redirect back after login
          sessionStorage.setItem('redirectPath', window.location.pathname);
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For non-401 errors or if token refresh also failed
    return Promise.reject(error);
  }
);

export default axiosInstance;
