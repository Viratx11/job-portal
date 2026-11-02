export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
export type WorkMode = 'REMOTE' | 'HYBRID' | 'ON_SITE';
export type ExperienceLevel = 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'MANAGER';
export type JobStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'EXPIRED';

export interface JobCategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface JobSkillResponse {
  id: number;
  name: string;
  slug: string;
  category: string;
}

export interface JobResponse {
  id: number;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  companyId: number;
  employerId: number;
  category?: JobCategoryResponse;
  skills?: JobSkillResponse[];
  city: string;
  country: string;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  jobType: JobType;
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
  status: JobStatus;
  openings: number;
  applicationCount: number;
  createdAt: string;
}

export interface JobSummaryResponse {
  id: number;
  title: string;
  companyId: number;
  city: string;
  country: string;
  jobType: JobType;
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
  status: JobStatus;
  openings: number;
  applicationCount: number;
}