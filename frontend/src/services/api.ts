import { apiClient } from './apiClient';

export type UserRole = 'ROLE_ADMIN' | 'ROLE_JOB_SEEKER' | 'ROLE_EMPLOYER';
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
export type WorkMode = 'REMOTE' | 'HYBRID' | 'ON_SITE';
export type ExperienceLevel = 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'MANAGER';
export type JobStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'EXPIRED';
export type CompanySize = 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';
export type CompanyType = 'STARTUP' | 'PRIVATE' | 'PUBLIC_LISTED' | 'GOVERNMENT' | 'NON_PROFIT' | 'EDUCATIONAL' | 'SELF_EMPLOYED';
export type IndustryType = 'TECHNOLOGY' | 'FINANCE_BANKING' | 'HEALTHCARE' | 'EDUCATION' | 'MANUFACTURING' | 'RETAIL_ECOMMERCE' | 'CONSULTING' | 'OTHER';
export type ApplicationStatus = 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'REJECTED' | 'HIRED' | 'WITHDRAWN';
export type SkillCategory = 'PROGRAMMING' | 'FRONTEND' | 'BACKEND' | 'DATABASE' | 'DEVOPS' | 'CLOUD' | 'MOBILE' | 'AI_ML' | 'DESIGN' | 'MANAGEMENT' | 'COMMUNICATION' | 'OTHER';
export type ProficiencyLevel = 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type LanguageProficiency = 'ELEMENTARY' | 'LIMITED_WORKING' | 'PROFESSIONAL_WORKING' | 'FULL_PROFESSIONAL' | 'NATIVE';
export type ResumeTemplate = 'PROFESSIONAL' | 'MODERN' | 'CREATIVE' | 'MINIMAL' | 'EXECUTIVE';
export type ResumeVisibility = 'PUBLIC' | 'PRIVATE' | 'RECRUITERS_ONLY';

export interface ApiResponse<T> {
  message: string;
  success: boolean;
  data: T;
}

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
  role: UserRole;
  userStatus?: string;
}

export interface JobCategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  active?: boolean;
}

export interface JobSkillResponse {
  id: number;
  name: string;
  slug: string;
  category: SkillCategory;
}

export interface JobTagResponse {
  id: number;
  name: string;
  slug: string;
}

export interface CompanyResponse {
  id: number;
  name: string;
  slug?: string;
  tagLine?: string;
  description?: string;
  email?: string;
  phone?: string;
  websiteUrl?: string;
  foundedYear?: number;
  companySize: CompanySize;
  companyType: CompanyType;
  industryType: IndustryType;
  ownerId: number;
  status?: string;
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
  tags?: JobTagResponse[];
  city: string;
  state?: string;
  country: string;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  jobType: JobType;
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
  status: JobStatus;
  openings?: number;
  applicationCount?: number;
  createdAt?: string;
}

export type Job = JobResponse;

export interface JobRequestPayload {
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  categoryId: number;
  companyId: number;
  skillIds?: number[];
  tagIds?: number[];
  city: string;
  country: string;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  jobType: JobType;
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
  openings?: number;
}

export interface ApplicationNoteResponse {
  id: number;
  addedByUserId: number;
  content: string;
  createdAt: string;
}

export interface ApplicationStatusHistoryResponse {
  id: number;
  fromStatus?: ApplicationStatus;
  toStatus: ApplicationStatus;
  changedByUserId?: number;
  note?: string;
  changedAt: string;
}

export interface ApplicationResponse {
  id: number;
  candidate?: UserResponse;
  employerId?: number;
  job?: {
    id: number;
    title: string;
    companyId: number;
    city: string;
    country: string;
    jobType: JobType;
    workMode: WorkMode;
  };
  company?: {
    id: number;
    name: string;
  };
  status: ApplicationStatus;
  resumeId: number;
  coverLetter?: string;
  expectedSalary?: number;
  availableFrom?: string;
  isRead?: boolean;
  isStarred?: boolean;
  notes?: ApplicationNoteResponse[];
  statusHistory?: ApplicationStatusHistoryResponse[];
  withdrawnAt?: string;
  withdrawnReason?: string;
  appliedAt?: string;
  updatedAt?: string;
  screening?: {
    overallScore?: number;
    skillsMatchScore?: number;
    experienceMatchScore?: number;
    educationMatchScore?: number;
    shortlistStatus?: string;
    summary?: string;
    matchedSkills?: string;
    missingSkills?: string;
    strengths?: string;
    concerns?: string;
  };
}

export interface ResumeResponse {
  id: number;
  candidateId: number;
  title: string;
  template: ResumeTemplate;
  visibility: ResumeVisibility;
  isDefault?: boolean;
  firstName?: string;
  lastName?: string;
  headline?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  websiteUrl?: string;
  leetcodeUrl?: string;
  codeforcesUrl?: string;
  personalInfo?: any;
  summary?: string;
  uploadedFileUrl?: string;
  uploadedFileName?: string;
  workExperiences?: any[];
  educations?: any[];
  skills?: any[];
  projects?: any[];
  certifications?: any[];
  awards?: any[];
  languages?: any[];
}

export const authApi = {
  signup: (data: { fullName: string; email: string; password: string; phone: string; role: UserRole }) =>
    apiClient.post('/auth/signup', data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data).then((r) => r.data),
};

export const userApi = {
  getProfile: () => apiClient.get<UserResponse>('/api/users/profile').then((r) => r.data),
  updateProfile: (data: { fullName?: string; phone?: string; profilePicture?: string }) =>
    apiClient.put<UserResponse>('/api/users/profile', data).then((r) => r.data),
  getAllUsers: () => apiClient.get<UserResponse[]>('/api/users').then((r) => r.data),
};

export const companyApi = {
  createCompany: (data: {
    name: string;
    tagline?: string;
    description?: string;
    website?: string;
    email?: string;
    phone?: string;
    foundedYear?: number;
    companySize: CompanySize;
    companyType: CompanyType;
    industryType: IndustryType;
  }) => apiClient.post<CompanyResponse>('/api/companies', data).then((r) => r.data),
  getMyCompany: () => apiClient.get<CompanyResponse>('/api/companies/my').then((r) => r.data),
  getAllCompanies: () => apiClient.get<CompanyResponse[]>('/api/companies').then((r) => r.data),
  getCompanyById: (id: number) => apiClient.get<CompanyResponse>(`/api/companies/${id}`).then((r) => r.data),
  updateCompany: (id: number, data: any) => apiClient.put<CompanyResponse>(`/api/companies/${id}`, data).then((r) => r.data),
  verifyCompany: (id: number) => apiClient.patch<CompanyResponse>(`/api/companies/${id}/verify`).then((r) => r.data),
};

export const categoryApi = {
  createCategory: (data: { name: string; description?: string; parentId?: number }) =>
    apiClient.post<JobCategoryResponse>('/api/job-categories', data).then((r) => r.data),
  getAllCategories: () => apiClient.get<JobCategoryResponse[]>('/api/job-categories').then((r) => r.data),
  getRootCategories: () => apiClient.get<JobCategoryResponse[]>('/api/job-categories/root').then((r) => r.data),
  deleteCategory: (id: number) => apiClient.delete(`/api/job-categories/${id}`),
};

export const jobSkillApi = {
  createSkill: (data: { name: string; category: SkillCategory }) =>
    apiClient.post<JobSkillResponse>('/api/job-skills', data).then((r) => r.data),
  getAllSkills: () => apiClient.get<JobSkillResponse[]>('/api/job-skills').then((r) => r.data),
  searchSkills: (keyword: string) =>
    apiClient.get<JobSkillResponse[]>('/api/job-skills/search', { params: { keyword } }).then((r) => r.data),
};

export const jobTagApi = {
  createTag: (data: { name: string }) => apiClient.post<JobTagResponse>('/api/job-tags', data).then((r) => r.data),
  getAllTags: () => apiClient.get<JobTagResponse[]>('/api/job-tags').then((r) => r.data),
};

export const getJobs = (params?: any) =>
  apiClient.get<JobResponse[]>('/api/jobs', { params }).then((r) => r.data);

export const getMyJobs = () =>
  apiClient.get<JobResponse[]>('/api/jobs/my').then((r) => r.data);

export const getAllJobsAdmin = () =>
  apiClient.get<JobResponse[]>('/api/jobs/admin').then((r) => r.data);

export const getJobById = (id: number) =>
  apiClient.get<JobResponse>(`/api/jobs/${id}`).then((r) => r.data);

export const createJob = (data: JobRequestPayload) =>
  apiClient.post<JobResponse>('/api/jobs', data).then((r) => r.data);

export const updateJob = (id: number, data: JobRequestPayload) =>
  apiClient.put<JobResponse>(`/api/jobs/${id}`, data).then((r) => r.data);

export const publishJob = (id: number) =>
  apiClient.patch<JobResponse>(`/api/jobs/${id}/publish`).then((r) => r.data);

export const closeJob = (id: number) =>
  apiClient.patch<JobResponse>(`/api/jobs/${id}/close`).then((r) => r.data);

export const deleteJob = (id: number) =>
  apiClient.delete(`/api/jobs/${id}`);

export const applicationApi = {
  createApplication: (data: {
    jobId: number;
    resumeId: number;
    coverLetter?: string;
    expectedSalary?: number;
    availableFrom?: string;
  }) => apiClient.post<ApplicationResponse>('/api/applications', data).then((r) => r.data),
  getMyApplications: () => apiClient.get<ApplicationResponse[]>('/api/applications/my').then((r) => r.data),
  getApplicationsForJob: (jobId: number) =>
    apiClient.get<ApplicationResponse[]>(`/api/applications/job/${jobId}`).then((r) => r.data),
  getApplicationsForCompany: (params?: any) =>
    apiClient.get<ApplicationResponse[]>('/api/applications/company', { params }).then((r) => r.data),
  updateStatus: (id: number, data: { status: ApplicationStatus; note?: string }) =>
    apiClient.patch<ApplicationResponse>(`/api/applications/${id}/status`, data).then((r) => r.data),
  withdraw: (id: number, reason: string) =>
    apiClient.patch<ApplicationResponse>(`/api/applications/${id}/withdraw`, { reason }).then((r) => r.data),
  markAsRead: (id: number) =>
    apiClient.patch<ApplicationResponse>(`/api/applications/${id}/read`).then((r) => r.data),
  toggleStar: (id: number) =>
    apiClient.patch<ApplicationResponse>(`/api/applications/${id}/star`).then((r) => r.data),
  deleteApplication: (id: number) => apiClient.delete(`/api/applications/${id}`).then((r) => r.data),
  addNote: (applicationId: number, content: string) =>
    apiClient.post<ApplicationNoteResponse>(`/api/applications/${applicationId}/notes`, { content }).then((r) => r.data),
  getNotes: (applicationId: number) =>
    apiClient.get<ApplicationNoteResponse[]>(`/api/applications/${applicationId}/notes`).then((r) => r.data),
  deleteNote: (applicationId: number, noteId: number) =>
    apiClient.delete(`/api/applications/${applicationId}/notes/${noteId}`).then((r) => r.data),
};

export const resumeApi = {
  createResume: (data: { title: string; template?: ResumeTemplate; visibility?: ResumeVisibility; isDefault?: boolean }) =>
    apiClient.post<ResumeResponse>('/api/resumes', data).then((r) => r.data),
  createFromLatex: (latexCode: string, title?: string) =>
    apiClient.post<ApiResponse<ResumeResponse>>('/api/ai/resume/create-from-latex', { latexCode, title }).then((r) => r.data.data),
  uploadResume: (file: File, title?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    return apiClient
      .post<ResumeResponse>('/api/resumes/upload', formData)
      .then((r) => r.data);
  },
  getMyResumes: () => apiClient.get<ResumeResponse[]>('/api/resumes').then((r) => r.data),
  getResume: (resumeId: number) => apiClient.get<ResumeResponse>(`/api/resumes/${resumeId}`).then((r) => r.data),
  updateResume: (resumeId: number, data: { title?: string; template?: ResumeTemplate; visibility?: ResumeVisibility; summary?: string }) =>
    apiClient.put<ResumeResponse>(`/api/resumes/${resumeId}`, data).then((r) => r.data),
  formatResumeWithTemplate: (resumeId: number, data: { template: ResumeTemplate; customInstructions?: string }) =>
    apiClient.post<ResumeResponse>(`/api/resumes/${resumeId}/format-template`, data).then((r) => r.data),
  updatePersonalInfo: (resumeId: number, data: any) =>
    apiClient.put<ResumeResponse>(`/api/resumes/${resumeId}/personal-info`, data).then((r) => r.data),
  setDefault: (resumeId: number) => apiClient.patch<ResumeResponse>(`/api/resumes/${resumeId}/set-default`).then((r) => r.data),
  deleteResume: (resumeId: number) => apiClient.delete(`/api/resumes/${resumeId}`),
  addSkill: (resumeId: number, data: { skillName: string; proficiencyLevel?: ProficiencyLevel; yearsOfExperience?: number }) =>
    apiClient.post(`/api/resumes/${resumeId}/skills`, data).then((r) => r.data),
  deleteSkill: (resumeId: number, skillId: number) =>
    apiClient.delete(`/api/resumes/${resumeId}/skills/${skillId}`),
  addExperience: (resumeId: number, data: any) =>
    apiClient.post(`/api/resumes/${resumeId}/work-experiences`, data).then((r) => r.data),
  deleteExperience: (resumeId: number, expId: number) =>
    apiClient.delete(`/api/resumes/${resumeId}/work-experiences/${expId}`),
  addEducation: (resumeId: number, data: any) =>
    apiClient.post(`/api/resumes/${resumeId}/educations`, data).then((r) => r.data),
  deleteEducation: (resumeId: number, eduId: number) =>
    apiClient.delete(`/api/resumes/${resumeId}/educations/${eduId}`),
  addProject: (resumeId: number, data: any) =>
    apiClient.post(`/api/resumes/${resumeId}/projects`, data).then((r) => r.data),
  deleteProject: (resumeId: number, projectId: number) =>
    apiClient.delete(`/api/resumes/${resumeId}/projects/${projectId}`),
  addCertification: (resumeId: number, data: any) =>
    apiClient.post(`/api/resumes/${resumeId}/certifications`, data).then((r) => r.data),
  deleteCertification: (resumeId: number, certId: number) =>
    apiClient.delete(`/api/resumes/${resumeId}/certifications/${certId}`),
  addAward: (resumeId: number, data: any) =>
    apiClient.post(`/api/resumes/${resumeId}/awards`, data).then((r) => r.data),
  deleteAward: (resumeId: number, awardId: number) =>
    apiClient.delete(`/api/resumes/${resumeId}/awards/${awardId}`),
  addLanguage: (resumeId: number, data: { languageName: string; proficiency: LanguageProficiency }) =>
    apiClient.post(`/api/resumes/${resumeId}/languages`, data).then((r) => r.data),
  deleteLanguage: (resumeId: number, langId: number) =>
    apiClient.delete(`/api/resumes/${resumeId}/languages/${langId}`),
  createParseJob: (data: { fileUrl: string; fileName: string; fileType: string; resumeId?: number }) =>
    apiClient.post('/api/resumes/parse-jobs', data).then((r) => r.data),
  getMyParseJobs: () => apiClient.get('/api/resumes/parse-jobs').then((r) => r.data),
};

export const aiApi = {
  generateCompanyDescription: (data: any) =>
    apiClient.post<ApiResponse<{ content: string }>>('/api/ai/company/describe', data).then((r) => r.data.data),
  generateCompanyTaglines: (data: any) =>
    apiClient.post<ApiResponse<{ taglines: string[] }>>('/api/ai/company/taglines', data).then((r) => r.data.data),
  generateJobDescription: (data: any) =>
    apiClient.post<ApiResponse<{ content: string }>>('/api/ai/job/describe', data).then((r) => r.data.data),
  generateJobRequirements: (title: string, category?: string) =>
    apiClient.get<ApiResponse<{ content: string }>>('/api/ai/job/requirements', { params: { title, category } }).then((r) => r.data.data),
  generateJobResponsibilities: (title: string, category?: string) =>
    apiClient.get<ApiResponse<{ content: string }>>('/api/ai/job/responsibilities', { params: { title, category } }).then((r) => r.data.data),
  generateJobBenefits: (title: string, category?: string, jobType?: string) =>
    apiClient.get<ApiResponse<{ content: string }>>('/api/ai/job/benefits', { params: { title, category, jobType } }).then((r) => r.data.data),
  suggestSalary: (data: any) =>
    apiClient.post<ApiResponse<{ minSalary: number; maxSalary: number; currency: string; period: string; marketInsight: string }>>('/api/ai/job/salary-suggestion', data).then((r) => r.data.data),
  recommendSkills: (title: string, description?: string) =>
    apiClient.get<ApiResponse<{ content: string }>>('/api/ai/job/skills-recommendation', { params: { title, description } }).then((r) => r.data.data),
  generateCoverLetter: (data: any) =>
    apiClient.post<ApiResponse<{ content: string }>>('/api/ai/application/cover-letter', data).then((r) => r.data.data),
  scoreCandidate: (data: any) =>
    apiClient.post<ApiResponse<any>>('/api/ai/application/screening-score', data).then((r) => r.data.data),
  analyzeSkillsGap: (data: any) =>
    apiClient.post<ApiResponse<any>>('/api/ai/application/skills-gap', data).then((r) => r.data.data),
  generateInterviewQuestions: (data: any) =>
    apiClient.post<ApiResponse<{ questions: { question: string; category: string; difficulty: string }[] }>>('/api/ai/application/interview-questions', data).then((r) => r.data.data),
  summarizeNotes: (notes: string[]) =>
    apiClient.post<ApiResponse<{ content: string }>>('/api/ai/application/summarize-notes', notes).then((r) => r.data.data),
  generateResumeSummary: (data: any) =>
    apiClient.post<ApiResponse<{ content: string }>>('/api/ai/resume/summary', data).then((r) => r.data.data),
  generateExperienceBullets: (data: any) =>
    apiClient.post<ApiResponse<{ bullets: string[] }>>('/api/ai/resume/experience-bullets', data).then((r) => r.data.data),
  parseResumeText: (resumeText: string) =>
    apiClient.post<ApiResponse<any>>('/api/ai/resume/parse', { resumeText }).then((r) => r.data.data),
  getResumeImprovements: (data: any) =>
    apiClient.post<ApiResponse<any>>('/api/ai/resume/improvements', data).then((r) => r.data.data),
  getCareerFeedback: (data: any) =>
    apiClient.post<ApiResponse<any>>('/api/ai/resume/career-feedback', data).then((r) => r.data.data),
  enhanceSearch: (query: string) =>
    apiClient.post<ApiResponse<any>>('/api/ai/search/enhance', { query }).then((r) => r.data.data),
  calculateJobMatch: (data: any) =>
    apiClient.post<ApiResponse<any>>('/api/ai/search/job-match', data).then((r) => r.data.data),
  extractProjectAi: (data: { url?: string; description?: string }) =>
    apiClient.post<ApiResponse<{ title: string; technologiesUsed: string; liveUrl?: string; githubUrl?: string; bulletPoints: string; bulletList?: string[] }>>('/api/ai/resume/extract-project', data).then((r) => r.data.data),
  extractCertAi: (data: { url?: string; description?: string }) =>
    apiClient.post<ApiResponse<{ certificationName: string; issuingOrganization: string; credentialUrl?: string; issueDate?: string }>>('/api/ai/resume/extract-cert', data).then((r) => r.data.data),
  extractJobFromUrl: (url: string) =>
    apiClient.post<ApiResponse<any>>('/api/ai/job/extract-url', { url }).then((r) => r.data.data),
};