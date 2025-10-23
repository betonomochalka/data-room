import axios from 'axios';

const API_URL = 'https://data-room-seven.vercel.app/api';

console.log('🔗 [API] Base URL configured:', API_URL);
console.log('🔗 [API] Environment variable REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors with comprehensive logging
api.interceptors.response.use(
  (response) => {
    console.log('✅ [API] Response received:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ [API] Request failed:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });

    // Handle different types of errors
    if (error.response?.status === 401) {
      console.log('🔐 [API] Unauthorized - clearing tokens and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 404) {
      console.error('🔍 [API] Endpoint not found - check if backend is deployed correctly');
    } else if (error.response?.status === 403) {
      console.error('🚫 [API] Forbidden - check CORS configuration');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('🌐 [API] Network error - check if backend is accessible');
    } else if (error.code === 'ERR_CANCELED') {
      console.error('⏹️ [API] Request was canceled');
    }

    return Promise.reject(error);
  }
);

export default api;

