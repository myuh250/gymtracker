import axios from 'axios';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080';
const LLM_SERVICE_BASE_URL = import.meta.env.VITE_LLM_SERVICE_BASE_URL || 'http://localhost:8001';

// ==============================================
// API Clients - Microservice Architecture
// ==============================================
// Auth Flow:
// 1. FE → Backend/LLM: User token in Authorization header
// 2. Backend: Validates via Spring Security + JwtAuthenticationFilter
// 3. LLM: Validates by calling Backend's /api/auth/validate
// 4. Token expires → Auto-refresh from Backend (withCredentials cookie)

const apiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Required for refresh token cookie
  timeout: 30000,
});

export const llmClient = axios.create({
  baseURL: LLM_SERVICE_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // No cookies for microservice
  timeout: 180000, // 3 min for AI operations
});

// ==============================================
// Token Refresh Queue (Shared State)
// ==============================================

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    error ? prom.reject(error) : prom.resolve(token);
  });
  failedQueue = [];
};

// ==============================================
// Utilities
// ==============================================

const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const markRequestAsRetry = (config) => {
  config._retry = true;
  return config;
};

// ==============================================
// Request Interceptors
// ==============================================

const createAuthRequestInterceptor = (includeToken = true) => (config) => {
  config.headers['X-Request-Id'] = generateRequestId();
  
  if (includeToken) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
};

apiClient.interceptors.request.use(createAuthRequestInterceptor(true));
llmClient.interceptors.request.use(createAuthRequestInterceptor(true));

// ==============================================
// Response Interceptors 
// ==============================================

const createAuthResponseInterceptor = (clientInstance) => async (error) => {
  const originalRequest = error.config;

  if (error.response?.status !== 401 || originalRequest?._retry) {
    return Promise.reject(error);
  }

  // Queue mechanism
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return clientInstance.request(originalRequest);
      })
      .catch(err => Promise.reject(err));
  }

  markRequestAsRetry(originalRequest);
  isRefreshing = true;

  try {
    const response = await axios.get(`${BACKEND_BASE_URL}/api/v1/auth/refresh`, {
      withCredentials: true,
    });

    const newAccessToken = response.data.data.accessToken;
    localStorage.setItem('accessToken', newAccessToken);

    processQueue(null, newAccessToken);
    isRefreshing = false;

    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    return clientInstance.request(originalRequest);
  } catch (refreshError) {
    processQueue(refreshError, null);
    isRefreshing = false;
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
    return Promise.reject(refreshError);
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  createAuthResponseInterceptor(apiClient)
);

llmClient.interceptors.response.use(
  (response) => response,
  createAuthResponseInterceptor(llmClient)
);

// ==============================================
// Helper Functions
// ==============================================

const ERROR_MESSAGES = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Your session has expired. Please log in again.',
  403: 'You don\'t have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This information is already in use. Please use different values.',
  422: 'Unable to process your request. Please check your input.',
  500: 'Server error occurred. Please try again later.',
  503: 'Service temporarily unavailable. Please try again later.',
};

export const getErrorMessage = (error) => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : 'An unexpected error occurred.';
  }

  // Priority: Server message > Status code mapping > Network error > Fallback
  const serverMessage = error.response?.data?.message;
  if (serverMessage && typeof serverMessage === 'string') {
    return serverMessage;
  }

  if (error.response?.status && ERROR_MESSAGES[error.response.status]) {
    return ERROR_MESSAGES[error.response.status];
  }

  if (error.code === 'ECONNABORTED') return 'Request timeout. Please try again.';
  if (error.code === 'ERR_NETWORK') return 'Network error. Please check your internet connection.';
  if (error.message) return error.message;

  return error.response?.status 
    ? `Request failed with status ${error.response.status}`
    : 'An unexpected error occurred. Please try again.';
};

export const checkServiceHealth = async (service = 'backend') => {
  try {
    const client = service === 'llm' ? llmClient : apiClient;
    const endpoint = service === 'llm' ? '/health' : '/actuator/health';
    await client.get(endpoint, { timeout: 5000 });
    return true;
  } catch (error) {
    console.error(`${service} service unavailable:`, getErrorMessage(error));
    return false;
  }
};

// ==============================================
// Exports
// ==============================================

export default apiClient;

export {
  apiClient as backendClient,
  BACKEND_BASE_URL,
  LLM_SERVICE_BASE_URL,
};
