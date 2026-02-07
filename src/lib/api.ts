import axios from 'axios';
import { storage, loadTokenIntoCache, clearTokenCache } from './storage';

// Ensure token cache is populated for sync reads in interceptors
let tokenCacheReady = false;
export const ensureTokenCache = (): Promise<void> => {
  if (tokenCacheReady) return Promise.resolve();
  return loadTokenIntoCache().then(() => { tokenCacheReady = true; });
};

const api = axios.create({
  baseURL: 'http://localhost:5002/api/v1',
  timeout: 120000,
});

api.interceptors.request.use(
  (config) => {
    const token = storage.getItemSync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 401: clear token; navigation to login is handled by AuthContext / navigation listener
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearTokenCache();
      storage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
