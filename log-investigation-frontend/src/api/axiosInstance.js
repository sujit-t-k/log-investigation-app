import axios from 'axios';

// Vite requires environment variables exposed to the client to be prefixed with VITE_
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to clean up query params (omit null, undefined, empty strings)
axiosInstance.interceptors.request.use(
  (config) => {
    if (config.params) {
      const sanitizedParams = {};
      Object.keys(config.params).forEach((key) => {
        const val = config.params[key];
        if (val !== undefined && val !== null && val !== '') {
          sanitizedParams[key] = typeof val === 'string' ? val.trim() : val;
        }
      });
      config.params = sanitizedParams;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to normalize error messages
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please check your connection.';
    let status = null;

    if (error.response) {
      status = error.response.status;
      const data = error.response.data;

      // Extract message from backend ErrorResponse structure { timestamp, status, error, message, path }
      if (data && data.message) {
        message = data.message;
      } else if (data && data.error) {
        message = data.error;
      } else if (status === 404) {
        message = 'The requested resource was not found.';
      } else if (status === 400) {
        message = 'Invalid request parameters. Please verify your inputs.';
      } else if (status === 500) {
        message = 'Backend internal server error. Please try again later.';
      }
    } else if (error.code === 'ECONNABORTED') {
      message = 'Request timed out. The server took too long to respond.';
    } else if (error.request) {
      message = 'Unable to reach the backend server. Please verify the service is running.';
    }

    const enhancedError = new Error(message);
    enhancedError.status = status;
    enhancedError.originalError = error;
    enhancedError.responseData = error.response?.data;

    return Promise.reject(enhancedError);
  }
);

export default axiosInstance;

