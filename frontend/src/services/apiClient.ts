import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  const userStr = localStorage.getItem('user');

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