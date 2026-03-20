import axios from 'axios';

const baseURL = "https://backend-forge-neet.onrender.com";
// const baseURL = "http://100.56.20.190:5002";
//ne5sa
// const baseURL = "http://localhost:5002";
export const API_BASE_URL = baseURL;
const api = axios.create({
  baseURL: `${baseURL}/api/v1`,
  timeout: 120000, // 2 minutes timeout for all API calls
  withCredentials: true,
});

const AUTH_REDIRECT_PATHS = new Set(['/app/login', '/app/signup']);
const AUTH_REDIRECT_STORAGE_KEY = 'auth_redirect_in_progress';

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    sessionStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');

      const requestUrl = String(error.config?.url || '');
      const currentPath = window.location.pathname;
      const isAuthBootstrapRequest = requestUrl.includes('/auth/me');
      const isAuthPage = AUTH_REDIRECT_PATHS.has(currentPath);
      const redirectInProgress = sessionStorage.getItem(AUTH_REDIRECT_STORAGE_KEY) === 'true';

      // Let the login/signup screens and auth bootstrap settle without forcing a reload loop.
      if (!isAuthBootstrapRequest && !isAuthPage && !redirectInProgress) {
        sessionStorage.setItem(AUTH_REDIRECT_STORAGE_KEY, 'true');
        window.location.replace('/app/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
