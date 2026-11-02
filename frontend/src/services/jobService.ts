import { apiClient } from './apiClient';
import type { JobResponse } from '../types/job.types';

export const getJobs = async () => {
  const response = await apiClient.get<JobResponse[]>('/api/jobs');
  return response.data;
};

export const getJobById = async (id: number) => {
  const response = await apiClient.get<JobResponse>(`/api/jobs/${id}`);
  return response.data;
};

export const createJob = async (jobData: any) => {
  const response = await apiClient.post<JobResponse>('/api/jobs', jobData);
  return response.data;
};

export const getMyJobs = async () => {
  const response = await apiClient.get<JobResponse[]>('/api/jobs/my');
  return response.data;
};