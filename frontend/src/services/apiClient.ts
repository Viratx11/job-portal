import axios from 'axios';

const CORE_API_URL = import.meta.env.VITE_CORE_API_URL || '';
const AI_API_URL = import.meta.env.VITE_AI_API_URL || '';

export const apiClient = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const url = config.url || '';
  if (AI_API_URL && (url.startsWith('/api/ai') || url.startsWith('/api/resumes'))) {
    config.baseURL = AI_API_URL.replace(/\/+$/, '');
  } else if (CORE_API_URL && (url.startsWith('/api') || url.startsWith('/auth'))) {
    config.baseURL = CORE_API_URL.replace(/\/+$/, '');
  }

  const token = localStorage.getItem('jwt');
  const userStr = localStorage.getItem('user');

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user?.id) config.headers['X-User-Id'] = String(user.id);
      if (user?.email) config.headers['X-User-Email'] = String(user.email);
    } catch {
      // ignore parse error
    }
  }
  return config;
});
