import { apiClient } from './apiClient';
import type { ApplicationResponse } from '../types/application.types';

export const createApplication = async (data: { jobId: number; resumeId: number; coverLetter?: string; expectedSalary?: number }) => {
  const response = await apiClient.post<ApplicationResponse>('/api/applications', data);
  return response.data;
};

export const getMyApplications = async () => {
  const response = await apiClient.get<ApplicationResponse[]>('/api/applications/my');
  return response.data;
};

export const getApplicationsForJob = async (jobId: number) => {
  const response = await apiClient.get<ApplicationResponse[]>(`/api/applications/job/${jobId}`);
  return response.data;
};