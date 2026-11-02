import type { UserResponse } from './auth.types';
import type { JobSummaryResponse } from './job.types';

export type ApplicationStatus = 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'REJECTED' | 'HIRED' | 'WITHDRAWN';
export type AiShortlistStatus = 'NOT_SCREENED' | 'AUTO_SHORTLISTED' | 'REVIEW_RECOMMENDED' | 'PENDING_REVIEW' | 'LOW_MATCH';

export interface ApplicationScreeningResponse {
  id: number;
  overallScore: number;
  skillsMatchScore: number;
  experienceMatchScore: number;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  shortlistStatus: AiShortlistStatus;
}

export interface ApplicationResponse {
  id: number;
  candidate: UserResponse;
  employerId: number;
  job: JobSummaryResponse;
  status: ApplicationStatus;
  resumeId: number;
  coverLetter?: string;
  expectedSalary?: number;
  appliedAt: string;
  screening?: ApplicationScreeningResponse;
}