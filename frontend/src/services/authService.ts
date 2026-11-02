import { apiClient } from './apiClient';
import type { AuthResponse } from '../types/auth.types';

export const login = async (credentials: { email: string; password: string }) => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

export const signup = async (data: any) => {
  const response = await apiClient.post<AuthResponse>('/auth/signup', data);
  return response.data;
};