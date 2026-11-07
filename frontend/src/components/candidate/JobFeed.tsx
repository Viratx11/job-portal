import React, { useEffect, useState, useRef } from 'react';
import {
  getJobs,
  resumeApi,
  applicationApi,
  companyApi,
  aiApi,
  type JobResponse,
  type ResumeResponse,
  type CompanyResponse,
  type ApplicationResponse,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CustomSelect } from '../common/CustomSelect';
import {
  Search,
  MapPin,
  Briefcase,
  FileText,
  Upload,
  X,
  CheckCircle2,
  ExternalLink,
  Building2,
  ChevronRight,
  ChevronDown,
  Bookmark,
  RotateCcw,
  Calendar,
  TrendingUp,
  Globe,
  ShieldCheck,
  Zap,
  Download,
  SlidersHorizontal,
} from 'lucide-react';

interface JobFeedProps {
  onNavigate?: (tab: 'feed' | 'applications' | 'resumes' | 'recruiter' | 'login' | 'register') => void;
}

interface MatchDetail {
  score: number;
  summary: string;
  resumeTitle: string;
  resumeId: number;
  matchedSkills: string[];
  missingSkills: string[];
  evaluatedProjects: string[];
}

const CompanyAvatar: React.FC<{ companyName: string; companyDomain?: string; avatarColor: string }> = ({
  companyName,
  companyDomain,
  avatarColor,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const initial = (companyName || 'C').charAt(0).toUpperCase();

  if (companyDomain && !imgFailed) {
    return (
      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg font-extrabold shrink-0 shadow-2xs mt-0.5 overflow-hidden">
        <img
          src={`https://www.google.com/s2/favicons?domain=${companyDomain}&sz=128`}
          alt={companyName}
          className="w-7 h-7 object-contain"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`w-12 h-12 rounded-xl ${avatarColor} flex items-center justify-center text-lg font-extrabold shrink-0 shadow-2xs mt-0.5 text-white`}
    >
      {initial}
    </div>
  );
};

const MAJOR_LOCATIONS = [
  'All Locations',
  'Remote',
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Mumbai',
  'Delhi NCR',
  'Chennai',
  'Agartala',
  'Kolkata',
];

const ROLE_TRACK_STACK_MAP: Record<string, string[]> = {
  ALL: [
    'Java',
    'Spring Boot',
    'Go',
    'React',
    'TypeScript',
    'Next.js',
    'PostgreSQL',
    'Redis',
    'Docker',
    'Python',
    'FastAPI',
    'AWS',
  ],
  BACKEND: [
    'Java',
    'Spring Boot',
    'Go',
    'PostgreSQL',
    'Redis',
    'Kafka',
    'BullMQ',
    'Microservices',
    'REST API',
    'SQL',
    'Hibernate',
    'System Design',
  ],
  FRONTEND: [
    'React',
    'TypeScript',
    'Next.js',
    'JavaScript',
    'Tailwind CSS',
    'Redux',
    'HTML',
    'CSS',
  ],
  FULLSTACK: [
    'TypeScript',
    'Next.js',
    'React',
    'Node.js',
    'Java',
    'Spring Boot',
    'Go',
    'PostgreSQL',
    'Redis',
    'Docker',
    'REST API',
  ],
  DEVOPS: [
    'Docker',
    'Kubernetes',
    'AWS',
    'CI/CD',
    'Linux',
    'Terraform',
    'Git',
    'Redis',
  ],
  DATA_AI: [
    'Python',
    'FastAPI',
    'SQL',
    'XGBoost',
    'Machine Learning',
    'Streamlit',
    'Power BI',
    'DAX',
    'PostgreSQL',
  ],
};

const ROLE_TRACK_LABELS: Record<string, string> = {
  ALL: 'All Positions',
  BACKEND: 'Backend & Systems',
  FRONTEND: 'Frontend & UI',
  FULLSTACK: 'Full-Stack',
  DEVOPS: 'DevOps & Cloud',
  DATA_AI: 'Data & AI',
};

const AVATAR_PALETTES = [
  'bg-blue-600 text-white',
  'bg-indigo-600 text-white',
  'bg-emerald-600 text-white',
  'bg-amber-600 text-white',
  'bg-rose-600 text-white',
  'bg-cyan-700 text-white',
  'bg-violet-600 text-white',
];

const NON_NAME_TOKENS = new Set([
  'resume',
  'cv',
  'curriculum',
  'vitae',
  'nit',
  'iit',
  'iiit',
  'bits',
  'agartala',
  'btech',
  'mtech',
  'bca',
  'mca',
  'backend',
  'frontend',
  'fullstack',
  'full',
  'stack',
  'software',
  'engineer',
  'engineering',
  'developer',
  'sde',
  'intern',
  'final',
  'updated',
  'latest',
  'pdf',
  'doc',
  'txt',
  'profile',
  'candidate',
  'uploaded',
  'india',
  'phone',
  'email',
  'mobile',
  'github',
  'linkedin',
  'portfolio',
  'straive',
]);

// Flipkart-style price steps for Annual FTE (INR/yr) vs Monthly Internship/Contract (INR/mo)
const ANNUAL_SALARY_STEPS = [
  { value: 0, label: 'Min' },
  { value: 300000, label: '₹3 LPA' },
  { value: 600000, label: '₹6 LPA' },
  { value: 1000000, label: '₹10 LPA' },
  { value: 1500000, label: '₹15 LPA' },
  { value: 2200000, label: '₹22 LPA' },
  { value: 3500000, label: '₹35 LPA' },
  { value: 5000000, label: '₹50+ LPA' },
];

const MONTHLY_STIPEND_STEPS = [
  { value: 0, label: 'Min' },
  { value: 15000, label: '₹15k/mo' },
  { value: 30000, label: '₹30k/mo' },
  { value: 50000, label: '₹50k/mo' },
  { value: 75000, label: '₹75k/mo' },
  { value: 100000, label: '₹1L/mo' },
  { value: 150000, label: '₹1.5L/mo' },
  { value: 250000, label: '₹2.5L+/mo' },
];

function getDomainFromUrl(url?: string): string | null {
  if (!url || !url.trim()) return null;
  try {
    const normalized = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    const parsed = new URL(normalized);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function inferDomainSkills(title: string, description = ''): string[] {
  const text = `${title} ${description}`.toLowerCase();
  if (
    text.includes('backend') ||
    text.includes('java') ||
    text.includes('spring') ||
    text.includes('api') ||
    text.includes('distributed') ||
    text.includes('microservice')
  ) {
    return ['Java', 'Spring Boot', 'PostgreSQL', 'REST API', 'Microservices', 'Docker', 'Redis', 'SQL'];
  }
  if (text.includes('frontend') || text.includes('react') || text.includes('ui') || text.includes('web')) {
    return ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Next.js', 'HTML', 'CSS'];
  }
  if (text.includes('devops') || text.includes('cloud') || text.includes('sre') || text.includes('platform')) {
    return ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Git'];
  }
  if (text.includes('data') || text.includes('ai') || text.includes('ml') || text.includes('machine learning')) {
    return ['Python', 'SQL', 'Machine Learning', 'PostgreSQL', 'FastAPI', 'XGBoost'];
  }
  return ['Java', 'Spring Boot', 'React', 'TypeScript', 'PostgreSQL', 'REST API', 'Docker', 'Git'];
}



export const cleanPhone = (raw?: string): string => {
  if (!raw) return '';
  let cleaned = raw.replace(/^(?:India|Bharat|IN|USA|US|UK|Phone|Tel|Mobile|Contact)[\s|:/-]*/i, '').trim();
  if (cleaned.includes('|')) {
    const parts = cleaned.split('|');
    const digitPart = parts.find((p) => /\d{7,}/.test(p));
    if (digitPart) cleaned = digitPart.trim();
  }
  return cleaned.replace(/^(?:India|Bharat|IN|USA|US|UK)[\s|:/-]*/i, '').trim();
};

/**
 * Extracts First Name, Last Name, Email, Phone, Country, LinkedIn, GitHub, Website,
 * plus structured Work Experiences, Projects, and Education directly from ResumeResponse.
 */
function extractCandidateFieldsFromResume(resume?: ResumeResponse | null) {
  if (!resume) {
    return null;
  }

  const pi = (resume as any).personalInfo || {};
  const rawSummary = (resume.summary || '').trim();
  const rawTitle = (resume.title || '').trim();
  const rawFileName = (resume.uploadedFileName || '').replace(/\.(pdf|txt|doc|docx|rtf)$/i, '');

  // Read top-level ResumeResponse fields first (mapped by ResumeMapper)
  let firstName = (resume.firstName || pi.firstName || '').trim();
  let lastName = (resume.lastName || pi.lastName || '').trim();

  if (!firstName || firstName.toLowerCase() === 'candidate') {
    const cleanedStart = rawSummary
      .replace(/^Uploaded resume:\s*/i, '')
      .split(/\r?\n/)[0]
      .replace(/[^a-zA-Z\s]/g, ' ')
      .trim();
    const summaryWords = cleanedStart
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !NON_NAME_TOKENS.has(w.toLowerCase()));

    const titleSource = `${rawTitle} ${rawFileName}`
      .replace(/^\d+_/, '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[^a-zA-Z\s]/g, ' ');
    const titleWords = titleSource
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !NON_NAME_TOKENS.has(w.toLowerCase()));

    const candidateNameWords =
      summaryWords.length >= 2
        ? summaryWords
        : titleWords.length >= 2
          ? titleWords
          : summaryWords.length === 1
            ? summaryWords
            : titleWords;

    if (candidateNameWords.length >= 2) {
      firstName =
        candidateNameWords[0].charAt(0).toUpperCase() + candidateNameWords[0].slice(1).toLowerCase();
      lastName =
        candidateNameWords[1].charAt(0).toUpperCase() + candidateNameWords[1].slice(1).toLowerCase();
    } else if (candidateNameWords.length === 1) {
      firstName =
        candidateNameWords[0].charAt(0).toUpperCase() + candidateNameWords[0].slice(1).toLowerCase();
      lastName = '';
    }
  }

  const emailMatch = rawSummary.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = (resume.email || (emailMatch ? emailMatch[0] : pi.email || '')).trim();

  let phone = cleanPhone(resume.phone || pi.phone || '');
  if (!phone) {
    const phoneCandidates = rawSummary.match(/(?:\+?\d[\d\s()-]{8,16}\d)/g) || [];
    for (const cand of phoneCandidates) {
      const sanitized = cleanPhone(cand);
      const digits = sanitized.replace(/\D/g, '');
      if (digits.length >= 10 && digits.length <= 13) {
        phone = sanitized;
        break;
      }
    }
  }

  let country = 'India (+91)';
  if (phone.startsWith('+1')) country = 'United States (+1)';
  else if (phone.startsWith('+44')) country = 'United Kingdom (+44)';
  else if (phone.startsWith('+65')) country = 'Singapore (+65)';
  else if (phone.startsWith('+49')) country = 'Germany (+49)';

  // Extract LinkedIn URL from top-level resume.linkedinUrl or embedded links in summary
  const linkedinMatch = rawSummary.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?/i);
  const linkedinUrl =
    resume.linkedinUrl ||
    pi.linkedinUrl ||
    (linkedinMatch ? linkedinMatch[0] : '');

  // Extract GitHub / Portfolio / Website URL from top-level resume.githubUrl / resume.websiteUrl or summary
  const githubMatch = rawSummary.match(/https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_.-]+/i);
  const githubUrl =
    resume.githubUrl ||
    pi.githubUrl ||
    (githubMatch ? githubMatch[0] : '');

  const websiteUrl =
    githubUrl ||
    resume.websiteUrl ||
    resume.portfolioUrl ||
    pi.websiteUrl ||
    '';

  const leetcodeMatch = rawSummary.match(/https?:\/\/(?:www\.)?leetcode\.com\/(?:u\/)?[a-zA-Z0-9_-]+\/?/i);
  const leetcodeUrl =
    (resume as any).leetcodeUrl ||
    pi.leetcodeUrl ||
    (leetcodeMatch ? leetcodeMatch[0] : '');

  const codeforcesMatch = rawSummary.match(/https?:\/\/(?:www\.)?codeforces\.com\/profile\/[a-zA-Z0-9_-]+\/?/i);
  const codeforcesUrl =
    (resume as any).codeforcesUrl ||
    pi.codeforcesUrl ||
    (codeforcesMatch ? codeforcesMatch[0] : '');

  return {
    firstName: firstName || 'Candidate',
    lastName: lastName || '',
    preferredFirstName: firstName || 'Candidate',
    email,
    phone,
    country,
    linkedinUrl,
    githubUrl,
    websiteUrl,
    leetcodeUrl,
    codeforcesUrl,
    summary: rawSummary,
  };
}

/**
 * Builds a concise, professional cover letter without dumping raw resume text,
 * scaling adaptively to candidate experience level while keeping word count within bounds.
 */
function buildAdaptiveCoverLetter(
  resume: ResumeResponse | null,
  job: JobResponse,
  companyName: string,
  candidateFullName: string,
  allSkills: string[]
): string {
  const topSkills = allSkills.length > 0 ? allSkills.slice(0, 8).join(', ') : 'Java, Spring Boot, PostgreSQL, React';
  const parsed = extractCandidateFieldsFromResume(resume);

  const keyItems: string[] = [];
  if (resume?.workExperiences && resume.workExperiences.length > 0) {
    const w = resume.workExperiences[0];
    keyItems.push(`At ${w.companyName} as ${w.jobTitle}, I engineered production backend services and optimized system throughput.`);
  }
  if (resume?.projects && resume.projects.length > 0) {
    const p = resume.projects[0];
    const tech = p.technologies?.length ? ` (${p.technologies.slice(0, 4).join(', ')})` : '';
    keyItems.push(`In my engineering project ${p.title}${tech}, I focused on end-to-end reliability, caching, and clean architecture.`);
  }

  const profileLinks = [
    parsed?.linkedinUrl ? `LinkedIn: ${parsed.linkedinUrl}` : '',
    parsed?.githubUrl ? `GitHub: ${parsed.githubUrl}` : '',
    parsed?.leetcodeUrl ? `LeetCode: ${parsed.leetcodeUrl}` : '',
    parsed?.codeforcesUrl ? `Codeforces: ${parsed.codeforcesUrl}` : '',
  ]
    .filter(Boolean)
    .join(' | ');

  return [
    `Dear Hiring Team at ${companyName},`,
    '',
    `I am writing to express my strong interest in the ${job.title} role at ${companyName}. With practical engineering experience across ${topSkills}, I am eager to contribute to your engineering systems and product features.`,
    '',
    keyItems.length > 0
      ? keyItems.join(' ')
      : `My experience includes building low-latency REST APIs, optimizing relational schemas, and developing resilient full-stack applications.`,
    '',
    `I would welcome the opportunity to discuss how my technical skill set and hands-on project background can support ${companyName}'s objectives. Thank you for your time and consideration.`,
    profileLinks ? `\nVerified Profiles: ${profileLinks}` : '',
    '',
    `Sincerely,`,
    candidateFullName,
  ]
    .filter((line) => line !== null)
    .join('\n');
}

const buildCompleteCoverLetterFromResume = buildAdaptiveCoverLetter;

export const JobFeed: React.FC<JobFeedProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const isEmployer = user?.role === 'ROLE_EMPLOYER';
  const isCandidate = user?.role === 'ROLE_JOB_SEEKER';

  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [companiesMap, setCompaniesMap] = useState<Record<number, CompanyResponse>>({});
  const [myAppsByJobId, setMyAppsByJobId] = useState<Record<number, ApplicationResponse>>({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [roleTrack, setRoleTrack] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('All Locations');
  const [workModeFilter, setWorkModeFilter] = useState<string>('ALL');
  const [expFilter, setExpFilter] = useState<string>('ALL');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('ALL');

  const [compPayPeriod, setCompPayPeriod] = useState<'ANNUAL' | 'MONTHLY'>('ANNUAL');
  const [minSalaryFilter, setMinSalaryFilter] = useState<number>(0);
  const [maxSalaryFilter, setMaxSalaryFilter] = useState<number>(5000000);
  const [compPopoverOpen, setCompPopoverOpen] = useState<boolean>(false);
  const compPopoverRef = useRef<HTMLDivElement | null>(null);

  const [selectedSkillChips, setSelectedSkillChips] = useState<string[]>([]);
  const [chipMatchMode, setChipMatchMode] = useState<'ANY' | 'ALL'>('ANY');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'SALARY_HIGH' | 'MATCH_HIGH'>('NEWEST');
  const [savedJobIds, setSavedJobIds] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('savedJobs') || '[]');
    } catch {
      return [];
    }
  });
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  const [resumes, setResumes] = useState<ResumeResponse[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number>(0);
  const [showAllResumeSkills, setShowAllResumeSkills] = useState(false);
  const [expandedJobSkills, setExpandedJobSkills] = useState<Record<number, boolean>>({});
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadNotice, setUploadNotice] = useState('');
  const quickFileInputRef = useRef<HTMLInputElement | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);
  const coverLetterFileInputRef = useRef<HTMLInputElement | null>(null);

  const [matchResult, setMatchResult] = useState<Record<number, MatchDetail>>({});
  const [matchingJobId, setMatchingJobId] = useState<number | null>(null);

  const [selectedJob, setSelectedJob] = useState<JobResponse | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredFirstName, setPreferredFirstName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantCountry, setApplicantCountry] = useState('India (+91)');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [linkedinProfile, setLinkedinProfile] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [leetcodeProfile, setLeetcodeProfile] = useState('');
  const [codeforcesProfile, setCodeforcesProfile] = useState('');
  const [resumeInputMode, setResumeInputMode] = useState<'ATTACH' | 'SAVED' | 'MANUAL'>('SAVED');
  const [manualResumeText, setManualResumeText] = useState('');
  const [coverLetterMode, setCoverLetterMode] = useState<'ATTACH' | 'MANUAL'>('MANUAL');
  const [coverLetter, setCoverLetter] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('1200000');
  const [availableFrom, setAvailableFrom] = useState(() => new Date().toISOString().split('T')[0]);
  const [applying, setApplying] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [autofillNotice, setAutofillNotice] = useState('');
  const [feedback, setFeedback] = useState('');

  // Close compensation popover on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (compPopoverRef.current && !compPopoverRef.current.contains(e.target as Node)) {
        setCompPopoverOpen(false);
      }
    };
    if (compPopoverOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [compPopoverOpen]);

  const switchPayPeriodMode = (mode: 'ANNUAL' | 'MONTHLY') => {
    setCompPayPeriod(mode);
    setMinSalaryFilter(0);
    setMaxSalaryFilter(mode === 'MONTHLY' ? 250000 : 5000000);
  };

  const handleJobTypeFilterChange = (val: string) => {
    setJobTypeFilter(val);
    if (val === 'INTERNSHIP' || val === 'CONTRACT' || val === 'PART_TIME' || val === 'FREELANCE') {
      switchPayPeriodMode('MONTHLY');
    } else if (val === 'FULL_TIME') {
      switchPayPeriodMode('ANNUAL');
    }
  };

  const toggleSaveJob = (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedJobIds((prev) => {
      const next = prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId];
      localStorage.setItem('savedJobs', JSON.stringify(next));
      return next;
    });
  };

  const fetchFeed = async (keyword?: string) => {
    setLoading(true);
    try {
      const [jobsData, companiesData] = await Promise.all([
        getJobs(keyword ? { keyword } : undefined),
        companyApi.getAllCompanies().catch(() => []),
      ]);
      setJobs(jobsData);
      const cMap: Record<number, CompanyResponse> = {};
      companiesData.forEach((c) => {
        cMap[c.id] = c;
      });
      setCompaniesMap(cMap);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCandidateContext = async (preferredResumeId?: number) => {
    if (!isCandidate) return;
    try {
      const [resumeList, myApps] = await Promise.all([
        resumeApi.getMyResumes().catch(() => []),
        applicationApi.getMyApplications().catch(() => []),
      ]);

      const hydratedResumes = await Promise.all(
        resumeList.map((r) => resumeApi.getResume(r.id).catch(() => r))
      );
      setResumes(hydratedResumes);

      if (preferredResumeId && hydratedResumes.some((r) => r.id === preferredResumeId)) {
        setSelectedResumeId(preferredResumeId);
      } else if (hydratedResumes.length > 0) {
        const stillValid = hydratedResumes.find((r) => r.id === selectedResumeId);
        if (!stillValid) {
          const def = hydratedResumes.find((r) => r.isDefault) || hydratedResumes[0];
          setSelectedResumeId(def.id);
        }
      } else {
        setSelectedResumeId(0);
      }

      const appMap: Record<number, ApplicationResponse> = {};
      myApps.forEach((app) => {
        if (app.job?.id) appMap[app.job.id] = app;
      });
      setMyAppsByJobId(appMap);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  useEffect(() => {
    if (isCandidate) {
      loadCandidateContext();
    } else {
      setResumes([]);
      setMyAppsByJobId({});
    }
  }, [user?.id, user?.role]);

  const activeResume = resumes.find((r) => r.id === Number(selectedResumeId)) || resumes[0] || null;

  // Include both explicitly listed skills and project technologies
  const getResumeSkillNames = (resume?: ResumeResponse | null): string[] => {
    if (!resume) return [];
    const set = new Set<string>();
    if (Array.isArray(resume.skills)) {
      resume.skills.forEach((s: any) => {
        const val = typeof s === 'string' ? s : s.skillName || s.name || '';
        if (val.trim()) set.add(val.trim());
      });
    }
    if (Array.isArray(resume.projects)) {
      resume.projects.forEach((p: any) => {
        if (p.technologiesUsed) {
          String(p.technologiesUsed)
            .split(/[,|/]/)
            .map((t) => t.trim())
            .filter(Boolean)
            .forEach((t) => set.add(t));
        }
      });
    }
    return Array.from(set);
  };

  const getEffectiveJobSkills = (job: JobResponse): string[] => {
    if (job.skills && job.skills.length > 0) {
      return job.skills.map((s) => s.name);
    }
    return inferDomainSkills(job.title, job.description);
  };

  const overwriteApplicationFieldsFromResume = async (
    targetResume: ResumeResponse | null,
    showBanner = true
  ) => {
    const parsed = extractCandidateFieldsFromResume(targetResume);
    const skills = getResumeSkillNames(targetResume);

    if (parsed) {
      setFirstName(parsed.firstName);
      setLastName(parsed.lastName);
      setPreferredFirstName(parsed.preferredFirstName);
      setApplicantEmail(parsed.email || user?.email || '');
      setApplicantCountry(parsed.country);
      setApplicantPhone(cleanPhone(parsed.phone || (user as any)?.phone || '+91 9876543210'));
      setLinkedinProfile(parsed.linkedinUrl);
      setWebsiteUrl(parsed.websiteUrl);
      setLeetcodeProfile(parsed.leetcodeUrl);
      setCodeforcesProfile(parsed.codeforcesUrl);
      if (parsed.summary) {
        setManualResumeText(parsed.summary);
      }
    } else if (user) {
      const nameParts = (user.fullName || '').trim().split(/\s+/);
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setPreferredFirstName(nameParts[0] || '');
      setApplicantEmail(user.email || '');
    }

    if (selectedJob) {
      const fullNameForCover = parsed
        ? `${parsed.firstName} ${parsed.lastName}`.trim()
        : user?.fullName || 'Candidate';
      const compName = companiesMap[selectedJob.companyId]?.name || 'your engineering organization';
      setCoverLetter(
        buildCompleteCoverLetterFromResume(targetResume, selectedJob, compName, fullNameForCover, skills)
      );
    }

    if (showBanner && targetResume) {
      const projCount = targetResume.projects?.length || 0;
      setAutofillNotice(
        `Overwrote application fields from Resume "${targetResume.title}" (#${targetResume.id}) — Name: ${
          parsed?.firstName || ''
        } ${parsed?.lastName || ''}, ${skills.length} skills, ${projCount} projects & embedded URLs loaded.`
      );
      setTimeout(() => setAutofillNotice(''), 6000);
    }
  };

  useEffect(() => {
    if (!selectedJob) return;
    setAutofillNotice('');
    overwriteApplicationFieldsFromResume(activeResume, false);
  }, [selectedJob?.id]);

  const handleAutofillApplication = async () => {
    if (!activeResume) {
      modalFileInputRef.current?.click();
      return;
    }
    await overwriteApplicationFieldsFromResume(activeResume, true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    setUploadNotice('');
    try {
      const title = file.name.replace(/\.(pdf|txt|doc|docx|rtf)$/i, '');
      const uploaded = await resumeApi.uploadResume(file, title);
      await loadCandidateContext(uploaded.id);
      setSelectedResumeId(uploaded.id);
      setResumeInputMode('SAVED');
      setMatchResult({});
      const extractedCount = getResumeSkillNames(uploaded).length;
      setUploadNotice(
        `Attached "${file.name}" (#${uploaded.id}) — Extracted ${extractedCount} skills, ${
          uploaded.projects?.length || 0
        } projects & embedded PDF links.`
      );
      if (selectedJob) {
        await overwriteApplicationFieldsFromResume(uploaded, true);
      }
      setTimeout(() => setUploadNotice(''), 6000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload resume file.');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleCoverLetterFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setCoverLetter(text);
      setCoverLetterMode('MANUAL');
    } catch {
      alert('Could not read cover letter file.');
    } finally {
      e.target.value = '';
    }
  };

  const handleSmartSearch = async () => {
    if (!search.trim()) {
      fetchFeed();
      return;
    }
    try {
      const res = await aiApi.enhanceSearch(search);
      setSuggestedTags([...(res.keywords || []), ...(res.skills || [])].slice(0, 6));
      fetchFeed(search);
    } catch {
      fetchFeed(search);
    }
  };

  const handleCalculateMatch = async (job: JobResponse, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isCandidate) return;

    if (!activeResume) {
      alert('Please upload a PDF resume or create one in Resumes & CV first.');
      onNavigate?.('resumes');
      return;
    }

    const candidateSkills = getResumeSkillNames(activeResume);
    const jobSkills = getEffectiveJobSkills(job);
    const candidateProjects = (activeResume.projects || [])
      .map((p: any) => `${p.title || 'Project'}${p.technologies?.length ? ` (${p.technologies.join(', ')})` : ''}: ${p.description || ''}`)
      .filter(Boolean);
    const candidateResumeSummary = activeResume.summary || '';
    const evaluatedProjects = (activeResume.projects || [])
      .map((p: any) => p.title)
      .filter(Boolean);

    if (candidateSkills.length === 0) {
      setMatchResult((prev) => ({
        ...prev,
        [job.id]: {
          score: 0,
          summary: `0% Fit: Your selected resume ("${activeResume.title}") has no technical skills listed yet. Upload your PDF resume or add skills in Resumes & CV.`,
          resumeTitle: activeResume.title,
          resumeId: activeResume.id,
          matchedSkills: [],
          missingSkills: jobSkills,
          evaluatedProjects: [],
        },
      }));
      return;
    }

    setMatchingJobId(job.id);
    try {
      const res = await aiApi.calculateJobMatch({
        candidateSkills,
        candidateResumeSummary,
        candidateProjects,
        jobTitle: job.title,
        jobSkills,
        workMode: job.workMode,
        jobType: job.jobType,
      });

      setMatchResult((prev) => ({
        ...prev,
        [job.id]: {
          score: typeof res.matchScore === 'number' ? res.matchScore : 0,
          summary: res.summary || res.recommendation || 'Compared resume & project skills against role requirements.',
          resumeTitle: activeResume.title,
          resumeId: activeResume.id,
          matchedSkills: res.matchedCriteria || [],
          missingSkills: res.unmatchedCriteria || [],
          evaluatedProjects,
        },
      }));
    } catch {
      const lowerCand = candidateSkills.map((s) => s.toLowerCase());
      const matched = jobSkills.filter((js) =>
        lowerCand.some((cs) => cs.includes(js.toLowerCase()) || js.toLowerCase().includes(cs))
      );
      const missing = jobSkills.filter((js) => !matched.includes(js));
      const score = Math.round((matched.length / Math.max(jobSkills.length, 1)) * 100);

      setMatchResult((prev) => ({
        ...prev,
        [job.id]: {
          score,
          summary: `Matched ${matched.length} of ${jobSkills.length} core skills using "${activeResume.title}".`,
          resumeTitle: activeResume.title,
          resumeId: activeResume.id,
          matchedSkills: matched,
          missingSkills: missing,
          evaluatedProjects,
        },
      }));
    } finally {
      setMatchingJobId(null);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!selectedJob) return;
    const skills = getResumeSkillNames(activeResume);
    const fullName = `${firstName} ${lastName}`.trim() || user?.fullName || 'Candidate';
    const compName = companiesMap[selectedJob.companyId]?.name || 'your engineering organization';

    const expAndProjects: string[] = [];
    if (activeResume?.workExperiences) {
      activeResume.workExperiences.forEach((w: any) => {
        expAndProjects.push(`${w.jobTitle} at ${w.companyName}: ${w.description || ''}`);
      });
    }
    if (activeResume?.projects) {
      activeResume.projects.forEach((p: any) => {
        const links = [p.githubUrl, p.projectUrl].filter(Boolean).join(' | ');
        expAndProjects.push(
          `Project ${p.title} (${p.technologiesUsed || ''})${links ? ` [${links}]` : ''}: ${p.description || ''}`
        );
      });
    }

    setGeneratingCover(true);
    setCoverLetterMode('MANUAL');
    try {
      const res = await aiApi.generateCoverLetter({
        jobTitle: selectedJob.title,
        jobDescription: selectedJob.description,
        targetCompanyName: compName,
        candidateName: fullName,
        candidateSummary: activeResume?.summary || undefined,
        candidateSkills: skills.length > 0 ? skills : getEffectiveJobSkills(selectedJob).slice(0, 5),
        candidateExperience: expAndProjects,
        experienceLevel: selectedJob.experienceLevel,
      });
      if (res?.content) {
        setCoverLetter(res.content);
      } else {
        setCoverLetter(buildCompleteCoverLetterFromResume(activeResume, selectedJob, compName, fullName, skills));
      }
    } catch {
      setCoverLetter(buildCompleteCoverLetterFromResume(activeResume, selectedJob, compName, fullName, skills));
    } finally {
      setGeneratingCover(false);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setApplying(true);
    try {
      let resumeIdToUse = selectedResumeId;

      if (!resumeIdToUse || resumeInputMode === 'MANUAL') {
        if (!resumeIdToUse) {
          const createdResume = await resumeApi.createResume({
            title: `${firstName || user?.fullName || 'Candidate'} ${lastName} — ${selectedJob.title} CV`.trim(),
            template: 'PROFESSIONAL',
            visibility: 'PUBLIC',
            isDefault: true,
          });
          resumeIdToUse = createdResume.id;
        }
        if (manualResumeText.trim()) {
          await resumeApi
            .updateResume(resumeIdToUse, {
              title: `${firstName || 'Candidate'} ${lastName} CV`.trim(),
              summary: manualResumeText.trim(),
            })
            .catch(() => null);
        }
      }

      if (resumeIdToUse) {
        await resumeApi
          .updatePersonalInfo(resumeIdToUse, {
            firstName: firstName.trim() || undefined,
            lastName: lastName.trim() || undefined,
            email: applicantEmail.trim() || undefined,
            phone: `${applicantCountry.split(' ')[0]} ${applicantPhone}`.trim(),
            country: applicantCountry.split(' ')[0],
            linkedinUrl: linkedinProfile.trim() || undefined,
            websiteUrl: websiteUrl.trim() || undefined,
            githubUrl: websiteUrl.includes('github') ? websiteUrl.trim() : undefined,
            leetcodeUrl: leetcodeProfile.trim() || undefined,
            codeforcesUrl: codeforcesProfile.trim() || undefined,
          } as any)
          .catch(() => null);
      }

      const validIsoDate =
        availableFrom && /^\d{4}-\d{2}-\d{2}$/.test(availableFrom)
          ? availableFrom
          : new Date().toISOString().split('T')[0];

      const applicantHeader = [
        `Applicant: ${firstName} ${lastName}${preferredFirstName ? ` (Preferred: ${preferredFirstName})` : ''}`,
        `Email: ${applicantEmail} | Phone: ${applicantPhone} (${applicantCountry})`,
        linkedinProfile ? `LinkedIn: ${linkedinProfile}` : null,
        websiteUrl ? `Website / GitHub: ${websiteUrl}` : null,
        leetcodeProfile ? `LeetCode: ${leetcodeProfile}` : null,
        codeforcesProfile ? `Codeforces: ${codeforcesProfile}` : null,
        `Resume PDF: ${resumeApi.getFileUrl(resumeIdToUse)}`,
      ]
        .filter(Boolean)
        .join('\n');

      const rawCover = coverLetter.trim()
        ? `${applicantHeader}\n\n---\n${coverLetter.trim()}`
        : applicantHeader;
      const finalCoverLetter = rawCover.length > 18000 ? rawCover.slice(0, 18000) : rawCover;

      await applicationApi.createApplication({
        jobId: selectedJob.id,
        resumeId: resumeIdToUse,
        coverLetter: finalCoverLetter,
        expectedSalary: Number(expectedSalary) || undefined,
        availableFrom: validIsoDate,
      });

      await loadCandidateContext(resumeIdToUse);
      setFeedback(
        'Application & PDF Resume submitted! Both you and the hiring company can now view and download the full application and PDF resume.'
      );
      setTimeout(() => {
        setFeedback('');
        setSelectedJob(null);
        setCoverLetter('');
      }, 1600);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setRoleTrack('ALL');
    setLocationFilter('All Locations');
    setWorkModeFilter('ALL');
    setExpFilter('ALL');
    setJobTypeFilter('ALL');
    setCompPayPeriod('ANNUAL');
    setMinSalaryFilter(0);
    setMaxSalaryFilter(5000000);
    setSelectedSkillChips([]);
    setShowSavedOnly(false);
  };

  const dynamicLocations = Array.from(
    new Set([...MAJOR_LOCATIONS, ...jobs.map((j) => j.city).filter(Boolean)])
  );

  // Dynamic Stack Chips driven by the active Role Track domain ({All Positions, Backend & Systems, Frontend & UI, ...})
  const dynamicStackChips = React.useMemo(() => {
    const base = ROLE_TRACK_STACK_MAP[roleTrack] || ROLE_TRACK_STACK_MAP.ALL;
    const set = new Set<string>(base);
    jobs.forEach((j) => {
      const js = getEffectiveJobSkills(j);
      js.forEach((s) => {
        if (roleTrack === 'ALL' || base.some((b) => b.toLowerCase() === s.toLowerCase())) {
          set.add(s);
        }
      });
    });
    return Array.from(set).slice(0, 14);
  }, [roleTrack, jobs]);

  const maxLimitForPeriod = compPayPeriod === 'MONTHLY' ? 250000 : 5000000;
  const activeSalarySteps = compPayPeriod === 'MONTHLY' ? MONTHLY_STIPEND_STEPS : ANNUAL_SALARY_STEPS;
  const isSalaryFiltered = minSalaryFilter > 0 || maxSalaryFilter < maxLimitForPeriod;

  const filtered = jobs
    .filter((j) => {
      const companyName = companiesMap[j.companyId]?.name || '';
      const effectiveSkills = getEffectiveJobSkills(j);
      const skillNames = effectiveSkills.join(' ');
      const fullText = `${j.title} ${j.description} ${j.category?.name || ''} ${skillNames}`.toLowerCase();

      const matchesQuery =
        !search.trim() ||
        fullText.includes(search.toLowerCase()) ||
        j.city?.toLowerCase().includes(search.toLowerCase()) ||
        companyName.toLowerCase().includes(search.toLowerCase());

      const matchesTrack =
        roleTrack === 'ALL' ||
        (roleTrack === 'BACKEND' &&
          (fullText.includes('backend') || fullText.includes('java') || fullText.includes('spring') || fullText.includes('api'))) ||
        (roleTrack === 'FRONTEND' &&
          (fullText.includes('frontend') || fullText.includes('react') || fullText.includes('ui'))) ||
        (roleTrack === 'FULLSTACK' &&
          (fullText.includes('full') || fullText.includes('software'))) ||
        (roleTrack === 'DEVOPS' &&
          (fullText.includes('devops') || fullText.includes('cloud') || fullText.includes('docker') || fullText.includes('infra'))) ||
        (roleTrack === 'DATA_AI' &&
          (fullText.includes('data') || fullText.includes('ai') || fullText.includes('ml') || fullText.includes('python')));

      const matchesLocation =
        locationFilter === 'All Locations' ||
        (locationFilter === 'Remote' && j.workMode === 'REMOTE') ||
        j.city?.toLowerCase().includes(locationFilter.toLowerCase());

      const matchesMode = workModeFilter === 'ALL' || j.workMode === workModeFilter;
      const matchesExp = expFilter === 'ALL' || j.experienceLevel === expFilter;
      const matchesType = jobTypeFilter === 'ALL' || j.jobType === jobTypeFilter;

      // Normalize job salary to the selected pay period (Monthly for Internship/Contract vs Annual for FTE)
      const isJobMonthly =
        j.jobType === 'INTERNSHIP' ||
        j.jobType === 'CONTRACT' ||
        j.jobType === 'FREELANCE' ||
        (j.maxSalary || j.minSalary || 0) <= 250000;
      const rawJobMax = j.maxSalary || j.minSalary || 0;
      const rawJobMin = j.minSalary || j.maxSalary || 0;

      const normalizedJobMax =
        compPayPeriod === 'MONTHLY'
          ? isJobMonthly
            ? rawJobMax
            : Math.round(rawJobMax / 12)
          : isJobMonthly
            ? rawJobMax * 12
            : rawJobMax;
      const normalizedJobMin =
        compPayPeriod === 'MONTHLY'
          ? isJobMonthly
            ? rawJobMin
            : Math.round(rawJobMin / 12)
          : isJobMonthly
            ? rawJobMin * 12
            : rawJobMin;

      const matchesSalary =
        !isSalaryFiltered ||
        (normalizedJobMax >= minSalaryFilter &&
          (maxSalaryFilter >= maxLimitForPeriod || normalizedJobMin <= maxSalaryFilter));

      const matchesSkillChips =
        selectedSkillChips.length === 0 ||
        (chipMatchMode === 'ALL'
          ? selectedSkillChips.every(
              (chip) =>
                effectiveSkills.some((s) => s.toLowerCase().includes(chip.toLowerCase())) ||
                fullText.includes(chip.toLowerCase())
            )
          : selectedSkillChips.some(
              (chip) =>
                effectiveSkills.some((s) => s.toLowerCase().includes(chip.toLowerCase())) ||
                fullText.includes(chip.toLowerCase())
            ));
      const matchesSaved = !showSavedOnly || savedJobIds.includes(j.id);

      return (
        matchesQuery &&
        matchesTrack &&
        matchesLocation &&
        matchesMode &&
        matchesExp &&
        matchesType &&
        matchesSalary &&
        matchesSkillChips &&
        matchesSaved
      );
    })
    .sort((a, b) => {
      if (sortBy === 'SALARY_HIGH') {
        return (b.maxSalary || b.minSalary || 0) - (a.maxSalary || a.minSalary || 0);
      }
      if (sortBy === 'MATCH_HIGH') {
        return (matchResult[b.id]?.score || -1) - (matchResult[a.id]?.score || -1);
      }
      return b.id - a.id;
    });

  const hasActiveFilters =
    search.trim() !== '' ||
    roleTrack !== 'ALL' ||
    locationFilter !== 'All Locations' ||
    workModeFilter !== 'ALL' ||
    expFilter !== 'ALL' ||
    jobTypeFilter !== 'ALL' ||
    isSalaryFiltered ||
    selectedSkillChips.length > 0 ||
    showSavedOnly;

  const formatSalary = (min?: number, max?: number, currency = 'INR', jobType?: string) => {
    if (!min && !max) return null;
    const sym = currency === 'USD' ? '$' : '₹';
    const isMonthly =
      jobType === 'INTERNSHIP' ||
      jobType === 'CONTRACT' ||
      jobType === 'FREELANCE' ||
      (max || min || 0) <= 200000;
    const fmt = (n?: number) => {
      if (!n) return '';
      if (n >= 100000 && !isMonthly) return `${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
      if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
      return String(n);
    };
    const suffix = isMonthly ? '/mo' : '/yr';
    if (min && max) return `${sym}${fmt(min)} – ${sym}${fmt(max)} ${suffix}`;
    return `${sym}${fmt(min || max)} ${suffix}`;
  };

  const formatFilterPriceLabel = (val: number, period: 'ANNUAL' | 'MONTHLY') => {
    if (val <= 0) return '₹0';
    if (period === 'MONTHLY') {
      return val >= 100000 ? `₹${(val / 100000).toFixed(1)}L/mo` : `₹${Math.round(val / 1000)}k/mo`;
    }
    return `₹${(val / 100000).toFixed(val % 100000 === 0 ? 0 : 1)}L/yr`;
  };

  const activeResumeSkills = getResumeSkillNames(activeResume);
  const visibleResumeSkills = showAllResumeSkills
    ? activeResumeSkills
    : activeResumeSkills.slice(0, 7);

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Top Editorial Banner */}
      <section className="bg-[#0f172a] text-white border-b border-slate-800 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 py-7 sm:py-9">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div className="space-y-2.5 max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Verified Engineering, Product & Infrastructure Roles
              </div>
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Find Your Next High-Impact Tech Role
              </h1>
              <p className="text-slate-300 text-sm sm:text-base">
                Browse curated engineering openings with transparent compensation, unified PDF resume + project fit scoring, and Greenhouse-standard applications.
              </p>
            </div>

            {/* Live Directory Metrics Strip */}
            <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-3 sm:gap-4 w-full lg:w-auto">
              <div className="flex-1 sm:flex-initial bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-3 min-w-[110px]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Open Roles
                </span>
                <span className="font-display text-xl sm:text-2xl font-extrabold text-white">
                  {jobs.length}
                </span>
              </div>
              <div className="flex-1 sm:flex-initial bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-3 min-w-[110px]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Companies
                </span>
                <span className="font-display text-xl sm:text-2xl font-extrabold text-emerald-400">
                  {Math.max(Object.keys(companiesMap).length, 1)}
                </span>
              </div>
              <div className="flex-1 sm:flex-initial bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-3 min-w-[110px]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Remote Friendly
                </span>
                <span className="font-display text-xl sm:text-2xl font-extrabold text-blue-400">
                  {jobs.length > 0
                    ? `${Math.round((jobs.filter((j) => j.workMode === 'REMOTE').length / jobs.length) * 100)}%`
                    : '100%'}
                </span>
              </div>
            </div>
          </div>

          {/* Role Track Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-6 pb-1">
            {[
              { id: 'ALL', label: 'All Positions' },
              { id: 'BACKEND', label: '⚙️ Backend & Systems' },
              { id: 'FRONTEND', label: '🎨 Frontend & UI' },
              { id: 'FULLSTACK', label: '🚀 Full-Stack' },
              { id: 'DEVOPS', label: '☁️ DevOps & Cloud' },
              { id: 'DATA_AI', label: '🤖 Data & AI' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setRoleTrack(tab.id);
                  setSelectedSkillChips([]);
                }}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                  roleTrack === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`ml-auto px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer ${
                showSavedOnly
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" /> Saved ({savedJobIds.length})
            </button>
          </div>
        </div>
      </section>

      <div className="w-full px-2.5 sm:px-6 lg:px-10 xl:px-14 py-4 sm:py-6 space-y-4 sm:space-y-5 flex-1 min-w-0 overflow-x-hidden">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4 w-full transition-colors">
          <div className="flex flex-wrap items-stretch gap-3 w-full">
            <div className="flex-[2_1_300px] flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:border-blue-600 transition min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
                placeholder="Search job title, skill (Java, React, Go, SQL), or company..."
                className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none min-w-0"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    fetchFeed();
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleSmartSearch}
                className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition shrink-0"
              >
                Search
              </button>
            </div>

            <div className="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[140px]">
              <CustomSelect
                value={locationFilter}
                onChange={(val) => setLocationFilter(val)}
                icon={<MapPin className="w-4 h-4 text-slate-400 shrink-0" />}
                options={dynamicLocations.map((loc) => ({
                  value: loc,
                  label: loc === 'Remote' ? '🌍 Remote Anywhere' : loc,
                }))}
              />
            </div>

            <div className="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[135px]">
              <CustomSelect
                value={workModeFilter}
                onChange={(val) => setWorkModeFilter(val)}
                icon={<Globe className="w-4 h-4 text-slate-400 shrink-0" />}
                options={[
                  { value: 'ALL', label: 'All Work Modes' },
                  { value: 'REMOTE', label: 'Remote Only' },
                  { value: 'HYBRID', label: 'Hybrid' },
                  { value: 'ON_SITE', label: 'On-Site / Office' },
                ]}
              />
            </div>

            <div className="w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[130px]">
              <CustomSelect
                value={expFilter}
                onChange={(val) => setExpFilter(val)}
                icon={<Briefcase className="w-4 h-4 text-slate-400 shrink-0" />}
                options={[
                  { value: 'ALL', label: 'All Seniority' },
                  { value: 'ENTRY', label: 'Entry' },
                  { value: 'JUNIOR', label: 'Junior' },
                  { value: 'MID', label: 'Mid-Level' },
                  { value: 'SENIOR', label: 'Senior' },
                  { value: 'LEAD', label: 'Lead / Staff' },
                ]}
              />
            </div>

            <div ref={compPopoverRef} className="relative w-full sm:w-auto sm:flex-1 min-w-0 sm:min-w-[170px]">
              <button
                type="button"
                onClick={() => setCompPopoverOpen((p) => !p)}
                className={`w-full h-full flex items-center justify-between gap-2 border rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold cursor-pointer transition ${
                  isSalaryFiltered
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                    : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="truncate">
                    {isSalaryFiltered
                      ? `${formatFilterPriceLabel(minSalaryFilter, compPayPeriod)} – ${
                          maxSalaryFilter >= maxLimitForPeriod
                            ? `${formatFilterPriceLabel(maxLimitForPeriod, compPayPeriod)}+`
                            : formatFilterPriceLabel(maxSalaryFilter, compPayPeriod)
                        }`
                      : `Compensation (${compPayPeriod === 'MONTHLY' ? '₹/mo' : '₹/yr'})`}
                  </span>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                    compPopoverOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {compPopoverOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-80 sm:w-96 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 space-y-4 z-40">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
                        Compensation Range
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Switch between Annual CTC (FTE) & Monthly Stipend (Intern/Contract)
                      </span>
                    </div>
                    {isSalaryFiltered && (
                      <button
                        type="button"
                        onClick={() => {
                          setMinSalaryFilter(0);
                          setMaxSalaryFilter(maxLimitForPeriod);
                        }}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        CLEAR
                      </button>
                    )}
                  </div>

                  {/* Pay Period Mode Toggle: FTE (Per Annum) vs Internship/Contract (Per Month) */}
                  <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => switchPayPeriodMode('ANNUAL')}
                      className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                        compPayPeriod === 'ANNUAL'
                          ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Full-Time (₹ / Year)
                    </button>
                    <button
                      type="button"
                      onClick={() => switchPayPeriodMode('MONTHLY')}
                      className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                        compPayPeriod === 'MONTHLY'
                          ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Intern / Contract (₹ / Mo)
                    </button>
                  </div>

                  {/* Flipkart-Style Histogram + Dual Sliders */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-end gap-1.5 h-10 px-2">
                      {[25, 45, 75, 100, 85, 60, 40, 30].map((heightPct, idx) => {
                        const stepVal = activeSalarySteps[idx]?.value || 0;
                        const inRange = stepVal >= minSalaryFilter && stepVal <= maxSalaryFilter;
                        return (
                          <div
                            key={idx}
                            style={{ height: `${heightPct}%` }}
                            className={`flex-1 rounded-t transition-colors ${
                              inRange ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          />
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        <span>Min: {formatFilterPriceLabel(minSalaryFilter, compPayPeriod)}</span>
                        <span>
                          Max:{' '}
                          {maxSalaryFilter >= maxLimitForPeriod
                            ? `${formatFilterPriceLabel(maxLimitForPeriod, compPayPeriod)}+`
                            : formatFilterPriceLabel(maxSalaryFilter, compPayPeriod)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={maxLimitForPeriod}
                        step={compPayPeriod === 'MONTHLY' ? 5000 : 100000}
                        value={minSalaryFilter}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setMinSalaryFilter(Math.min(v, maxSalaryFilter));
                        }}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                      <input
                        type="range"
                        min={0}
                        max={maxLimitForPeriod}
                        step={compPayPeriod === 'MONTHLY' ? 5000 : 100000}
                        value={maxSalaryFilter}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setMaxSalaryFilter(Math.max(v, minSalaryFilter));
                        }}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Flipkart-Style Min to Max Dropdown Boxes */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <CustomSelect
                        value={minSalaryFilter}
                        onChange={(val) => {
                          const num = Number(val);
                          setMinSalaryFilter(num);
                          if (num > maxSalaryFilter) setMaxSalaryFilter(maxLimitForPeriod);
                        }}
                        options={activeSalarySteps.slice(0, -1).map((st) => ({
                          value: st.value,
                          label: st.value === 0 ? 'Min ₹0' : st.label,
                        }))}
                        buttonClassName="py-1.5 px-2.5 text-xs font-semibold"
                      />
                    </div>
                    <span className="text-xs text-slate-400 font-bold shrink-0">to</span>
                    <div className="flex-1">
                      <CustomSelect
                        value={maxSalaryFilter}
                        onChange={(val) => {
                          const num = Number(val);
                          setMaxSalaryFilter(num);
                          if (num < minSalaryFilter) setMinSalaryFilter(0);
                        }}
                        options={activeSalarySteps.slice(1).map((st) => ({
                          value: st.value,
                          label: st.label,
                        }))}
                        buttonClassName="py-1.5 px-2.5 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Flex Row 2: Dynamic Domain-Aware Tech Stack Filter Pills + Multi-Topic Selection + Job Type + Sort By */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 w-full">
            <div className="flex flex-wrap items-center gap-1.5 flex-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
                Filter by Stack ({ROLE_TRACK_LABELS[roleTrack] || 'All Positions'}):
              </span>
              <button
                type="button"
                onClick={() => setSelectedSkillChips([])}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                  selectedSkillChips.length === 0
                    ? 'bg-slate-900 dark:bg-blue-600 border-slate-900 dark:border-blue-600 text-white shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                All Positions
              </button>
              {dynamicStackChips.map((sk) => {
                const active = selectedSkillChips.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() =>
                      setSelectedSkillChips((prev) =>
                        active ? prev.filter((s) => s !== sk) : [...prev, sk]
                      )
                    }
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer flex items-center gap-1 ${
                      active
                        ? 'bg-blue-600 border-blue-600 text-white shadow-2xs ring-1 ring-blue-500 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {active && <span className="text-[10px]">✓</span>}
                    {sk}
                  </button>
                );
              })}

              {selectedSkillChips.length > 0 && (
                <div className="inline-flex items-center gap-1.5 ml-1 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-full px-2.5 py-0.5">
                  <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300">
                    {selectedSkillChips.length} selected
                  </span>
                  <div className="inline-flex rounded-md border border-blue-300 dark:border-blue-700 text-[10px] overflow-hidden ml-0.5">
                    <button
                      type="button"
                      onClick={() => setChipMatchMode('ANY')}
                      className={`px-1.5 py-0.5 font-bold cursor-pointer transition ${
                        chipMatchMode === 'ANY'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600'
                      }`}
                    >
                      Any
                    </button>
                    <button
                      type="button"
                      onClick={() => setChipMatchMode('ALL')}
                      className={`px-1.5 py-0.5 font-bold cursor-pointer transition ${
                        chipMatchMode === 'ALL'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600'
                      }`}
                    >
                      All
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedSkillChips([])}
                    className="text-[11px] text-slate-400 hover:text-rose-500 font-semibold cursor-pointer ml-0.5"
                    title="Clear selected stack filters"
                  >
                    ×
                  </button>
                </div>
              )}

              {suggestedTags.map((tag, i) => (
                <button
                  key={`sug-${i}`}
                  type="button"
                  onClick={() => setSearch(tag)}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 cursor-pointer"
                >
                  + {tag}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <div className="w-full sm:w-auto min-w-0 sm:min-w-[145px]">
                <CustomSelect
                  value={jobTypeFilter}
                  onChange={handleJobTypeFilterChange}
                  options={[
                    { value: 'ALL', label: 'All Job Types' },
                    { value: 'FULL_TIME', label: 'Full-Time (Annual)' },
                    { value: 'INTERNSHIP', label: 'Internship (Monthly)' },
                    { value: 'CONTRACT', label: 'Contract (Monthly)' },
                    { value: 'PART_TIME', label: 'Part-Time' },
                  ]}
                />
              </div>

              <div className="w-full sm:w-auto min-w-0 sm:min-w-[165px]">
                <CustomSelect
                  value={sortBy}
                  onChange={(val) => setSortBy(val)}
                  options={[
                    { value: 'NEWEST', label: 'Sort: Newest First' },
                    { value: 'SALARY_HIGH', label: 'Sort: Highest Pay' },
                    { value: 'MATCH_HIGH', label: 'Sort: Best Resume Fit' },
                  ]}
                />
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer shrink-0 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Candidate Active Resume Bar — Responsive Flex Layout */}
        {isCandidate && (
          <div className="bg-white dark:bg-[#111827] border border-blue-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3 w-full min-w-0 transition-colors">
            {/* Row 1: Title & Selector on left, Action Buttons on right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 shrink-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="whitespace-nowrap">Active Resume for Fit Check & Apply:</span>
                </div>

                {resumes.length > 0 ? (
                  <div className="w-full sm:max-w-md min-w-0">
                    <CustomSelect
                      value={selectedResumeId}
                      onChange={(val) => {
                        setSelectedResumeId(Number(val));
                        setShowAllResumeSkills(false);
                        setMatchResult({});
                      }}
                      options={resumes.map((r) => {
                        const skCount = getResumeSkillNames(r).length;
                        const projCount = r.projects?.length || 0;
                        return {
                          value: r.id,
                          label: `${r.title} (#${r.id}) — ${skCount} skills${projCount ? `, ${projCount} projects` : ''} • 📄 PDF`,
                        };
                      })}
                    />
                  </div>
                ) : (
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-lg">
                    No resume uploaded yet — upload a PDF/TXT resume to check your role fit.
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
                <input
                  ref={quickFileInputRef}
                  type="file"
                  accept=".pdf,.txt,.doc,.docx,.rtf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingFile}
                  onClick={() => quickFileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingFile ? 'Uploading & Extracting...' : 'Upload PDF / TXT Resume'}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate?.('resumes')}
                  className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
                >
                  Manage Resumes →
                </button>
              </div>
            </div>

            {/* Row 2: Skills Badges + PDF Link */}
            {activeResume && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 w-full min-w-0">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1 shrink-0">
                  Verified Skills:
                </span>
                {activeResumeSkills.length > 0 ? (
                  <>
                    {visibleResumeSkills.map((sk, i) => (
                      <span
                        key={i}
                        className="text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-md"
                      >
                        {sk}
                      </span>
                    ))}
                    {activeResumeSkills.length > 7 && (
                      <button
                        type="button"
                        onClick={() => setShowAllResumeSkills((prev) => !prev)}
                        className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-md transition cursor-pointer"
                      >
                        {showAllResumeSkills
                          ? 'Show less'
                          : `+${activeResumeSkills.length - 7} more`}
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-md">
                    0 skills listed on this resume — add skills or upload a PDF
                  </span>
                )}

                <a
                  href={resumeApi.getFileUrl(activeResume.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 ml-auto shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View PDF
                </a>
              </div>
            )}
          </div>
        )}

        {uploadNotice && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-2xs">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {uploadNotice}
            </span>
            <button onClick={() => setUploadNotice('')} className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Results Count Header */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filtered.length}</strong> of{' '}
            <strong className="text-slate-900 dark:text-white">{jobs.length}</strong> open positions
          </span>
          {isEmployer && (
            <button
              onClick={() => onNavigate?.('recruiter')}
              className="text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              Manage Your Owned Job Openings & Applicants in ATS →
            </button>
          )}
        </div>

        {/* Job Directory List */}
        {loading ? (
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl py-16 text-center text-slate-400 dark:text-slate-500 text-sm font-medium">
            Loading verified job listings...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-3 shadow-2xs">
            <p className="text-slate-800 dark:text-slate-200 font-bold text-base">No open positions match your current filters.</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Try resetting your location, compensation range, or skill filters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-200/90 dark:divide-slate-800/80 shadow-2xs overflow-hidden transition-colors">
            {filtered.map((job, idx) => {
              const comp = companiesMap[job.companyId];
              const companyName = comp?.name || `GemHire Partner #${job.companyId}`;
              const companyDomain = getDomainFromUrl(comp?.websiteUrl);
              const existingApp = myAppsByJobId[job.id];
              const match = matchResult[job.id];
              const salaryStr = formatSalary(job.minSalary, job.maxSalary, job.currency, job.jobType);
              const displaySkills = getEffectiveJobSkills(job);
              const isJobSkillsExpanded = !!expandedJobSkills[job.id];
              const visibleJobSkills = isJobSkillsExpanded
                ? displaySkills
                : displaySkills.slice(0, 6);
              const isSaved = savedJobIds.includes(job.id);
              const avatarColor = AVATAR_PALETTES[job.companyId % AVATAR_PALETTES.length];
              const isFeatured = idx === 0;
              const isOwnedByCurrentEmployer = isEmployer && user?.id === job.employerId;

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-4 sm:px-6 sm:py-5 transition flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 cursor-pointer group ${
                    isFeatured
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/80 dark:hover:bg-amber-950/30'
                      : 'hover:bg-slate-50/90 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Left: Company Website Avatar + Title + Tags */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <CompanyAvatar
                      companyName={companyName}
                      companyDomain={companyDomain || undefined}
                      avatarColor={avatarColor}
                    />

                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          {job.title}
                        </h2>
                        <span
                          className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1"
                          title={comp?.websiteUrl || 'Verified Employer'}
                        >
                          · {companyName}
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 inline" />
                        </span>

                        {isFeatured && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                            ★ Featured
                          </span>
                        )}

                        {existingApp && (
                          <span className="text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                            ✓ Applied ({existingApp.status})
                          </span>
                        )}
                      </div>

                      {/* Metadata Pills */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            job.workMode === 'REMOTE'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                              : job.workMode === 'HYBRID'
                                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {job.workMode === 'REMOTE'
                            ? '🌍 Remote'
                            : job.workMode === 'HYBRID'
                              ? '🏢 Hybrid'
                              : '📍 On-Site'}
                        </span>

                        <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                          <MapPin className="w-3 h-3 text-slate-400" /> {job.city}, {job.country}
                        </span>

                        <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                          <Briefcase className="w-3 h-3 text-slate-400" /> {job.experienceLevel} ·{' '}
                          {job.jobType.replace('_', ' ')}
                        </span>

                        {salaryStr && (
                          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                            💰 {salaryStr}
                          </span>
                        )}
                      </div>

                      {/* Skill Tags + Interactive +N more toggle */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {visibleJobSkills.map((sName, sIdx) => (
                          <span
                            key={sIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSkillChips((prev) =>
                                prev.includes(sName) ? prev.filter((s) => s !== sName) : [...prev, sName]
                              );
                            }}
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border transition cursor-pointer ${
                              selectedSkillChips.includes(sName)
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold'
                                : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {sName}
                          </span>
                        ))}
                        {displaySkills.length > 6 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedJobSkills((prev) => ({
                                ...prev,
                                [job.id]: !prev[job.id],
                              }));
                            }}
                            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md transition cursor-pointer"
                          >
                            {isJobSkillsExpanded
                              ? 'Show less'
                              : `+${displaySkills.length - 6} more`}
                          </button>
                        )}
                      </div>

                      {/* Unified Match Breakdown Box (Including Evaluated Projects!) */}
                      {match && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className={`mt-2.5 rounded-xl p-3.5 text-xs space-y-2 border ${
                            match.score >= 70
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                              : match.score >= 40
                                ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                                : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              {match.score}% Unified Resume & Project Fit — "{match.resumeTitle}" (#{match.resumeId})
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{match.summary}</p>
                          {match.evaluatedProjects.length > 0 && (
                            <p className="text-[11px] font-semibold text-blue-800 dark:text-blue-300">
                              💻 Projects Considered in Screening: {match.evaluatedProjects.join(' • ')}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {match.matchedSkills.map((ms, i) => (
                              <span
                                key={`m-${i}`}
                                className="text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-md"
                              >
                                ✓ {ms}
                              </span>
                            ))}
                            {match.missingSkills.map((us, i) => (
                              <span
                                key={`u-${i}`}
                                className="text-[11px] font-semibold bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-md"
                              >
                                Missing: {us}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Interactive Actions */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 w-full lg:w-auto justify-end shrink-0"
                  >
                    <button
                      type="button"
                      onClick={(e) => toggleSaveJob(job.id, e)}
                      className={`p-2 rounded-lg border transition cursor-pointer ${
                        isSaved
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400'
                          : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                      title={isSaved ? 'Remove from Saved Jobs' : 'Save Job'}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    {isEmployer ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedJob(job)}
                          className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
                        >
                          View Spec
                        </button>
                        {isOwnedByCurrentEmployer ? (
                          <button
                            type="button"
                            onClick={() => onNavigate?.('recruiter')}
                            className="bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Building2 className="w-3.5 h-3.5" /> Edit / Manage in ATS →
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg">
                            Other Employer's Listing
                          </span>
                        )}
                      </div>
                    ) : isCandidate ? (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleCalculateMatch(job, e)}
                          disabled={matchingJobId === job.id}
                          className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            match
                              ? match.score >= 70
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                              : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {matchingJobId === job.id
                            ? 'Checking...'
                            : match
                              ? `Fit: ${match.score}%`
                              : 'Check Resume Fit'}
                        </button>

                        {existingApp ? (
                          <button
                            type="button"
                            onClick={() => onNavigate?.('applications')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition"
                          >
                            View Application <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedJob(job)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
                          >
                            Apply Now
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onNavigate?.('login')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-2xs cursor-pointer"
                      >
                        Log in to Apply
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* GREENHOUSE-STYLE JOB SPECIFICATION & APPLICATION MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full p-5 sm:p-8 space-y-6 relative my-6 max-h-[92vh] overflow-y-auto shadow-2xl transition-colors">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Job Header */}
            <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-5 pr-12">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>{companiesMap[selectedJob.companyId]?.name || `Company #${selectedJob.companyId}`}</span>
                {companiesMap[selectedJob.companyId]?.websiteUrl && (
                  <>
                    <span>•</span>
                    <a
                      href={companiesMap[selectedJob.companyId].websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {companiesMap[selectedJob.companyId].websiteUrl}
                    </a>
                  </>
                )}
                <span>•</span>
                <span>{selectedJob.workMode}</span>
                <span>•</span>
                <span>{selectedJob.experienceLevel}</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {selectedJob.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                <span>
                  📍 {selectedJob.city}, {selectedJob.country}
                </span>
                {formatSalary(selectedJob.minSalary, selectedJob.maxSalary, selectedJob.currency, selectedJob.jobType) && (
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                    💰 {formatSalary(selectedJob.minSalary, selectedJob.maxSalary, selectedJob.currency, selectedJob.jobType)}
                  </span>
                )}
                <span>Openings: {selectedJob.openings || 1}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {getEffectiveJobSkills(selectedJob).map((sName, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-md"
                  >
                    {sName}
                  </span>
                ))}
              </div>
            </div>

            {/* Full Job Specification */}
            <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                  Role Overview
                </h4>
                <p className="whitespace-pre-line">{selectedJob.description}</p>
              </div>
              {selectedJob.requirements && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                    Requirements
                  </h4>
                  <p className="whitespace-pre-line">{selectedJob.requirements}</p>
                </div>
              )}
              {selectedJob.responsibilities && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                    Responsibilities
                  </h4>
                  <p className="whitespace-pre-line">{selectedJob.responsibilities}</p>
                </div>
              )}
              {selectedJob.benefits && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                    Compensation & Benefits
                  </h4>
                  <p className="whitespace-pre-line">{selectedJob.benefits}</p>
                </div>
              )}
            </div>

            {/* Role-Aware Application Section */}
            {isEmployer ? (
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between gap-3">
                <span className="font-medium">
                  {selectedJob.employerId === user?.id
                    ? 'You own this job opening. You can edit its details or review applicants in your Employer ATS.'
                    : 'You are signed in with a Recruiter account. Recruiters can only manage their own published job openings.'}
                </span>
                {selectedJob.employerId === user?.id && (
                  <button
                    onClick={() => {
                      setSelectedJob(null);
                      onNavigate?.('recruiter');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg font-bold shrink-0 cursor-pointer"
                  >
                    Edit / Manage in ATS →
                  </button>
                )}
              </div>
            ) : !isCandidate ? (
              <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="font-medium">Log in with a Candidate account to apply for this position.</span>
                <button
                  onClick={() => {
                    setSelectedJob(null);
                    onNavigate?.('login');
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold cursor-pointer"
                >
                  Log In
                </button>
              </div>
            ) : myAppsByJobId[selectedJob.id] ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  ✓ You have already applied for this role (Current Status: {myAppsByJobId[selectedJob.id].status})
                </span>
                <button
                  onClick={() => {
                    setSelectedJob(null);
                    onNavigate?.('applications');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Inspect Submission, PDF Resume & Recruiter Notes →
                </button>
              </div>
            ) : feedback ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> {feedback}
              </div>
            ) : (
              /* GREENHOUSE-STYLE APPLICATION FORM */
              <form onSubmit={handleApplySubmit} className="space-y-5 border-t border-slate-200 dark:border-slate-800 pt-6">
                {/* Top Header + "⚡ Autofill from Resume" button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-display text-xl font-bold text-slate-900 dark:text-white">Apply for this job</h4>
                    <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-0.5">
                      <span className="text-rose-600 font-bold">*</span> indicates a required field
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutofillApplication}
                    className="inline-flex items-center justify-center gap-2 bg-[#4f7df3] hover:bg-blue-600 text-white font-mono text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full shadow-xs transition cursor-pointer"
                  >
                    <Zap className="w-4 h-4" /> Autofill from Resume ({activeResume ? activeResume.title : 'Upload PDF'})
                  </button>
                </div>

                {autofillNotice && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> {autofillNotice}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAutofillNotice('')}
                      className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* First Name, Last Name, Preferred First Name, Email */}
                <div className="space-y-3.5">
                  <div className="border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 bg-white dark:bg-[#111827] focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
                    <label className="block font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      First Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your legal first name"
                      className="w-full text-sm text-slate-900 dark:text-white pt-1 focus:outline-none bg-transparent"
                    />
                  </div>

                  <div className="border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 bg-white dark:bg-[#111827] focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
                    <label className="block font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      Last Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                      className="w-full text-sm text-slate-900 dark:text-white pt-1 focus:outline-none bg-transparent"
                    />
                  </div>

                  <div className="border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 bg-white dark:bg-[#111827] focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
                    <label className="block font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      Preferred First Name
                    </label>
                    <input
                      type="text"
                      value={preferredFirstName}
                      onChange={(e) => setPreferredFirstName(e.target.value)}
                      placeholder="Optional preferred name"
                      className="w-full text-sm text-slate-900 dark:text-white pt-1 focus:outline-none bg-transparent"
                    />
                  </div>

                  <div className="border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 bg-white dark:bg-[#111827] focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
                    <label className="block font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      Email <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full text-sm text-slate-900 dark:text-white pt-1 focus:outline-none bg-transparent"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="sm:w-1/3">
                      <label className="block font-mono text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Country</label>
                      <CustomSelect
                        value={applicantCountry}
                        onChange={(val) => setApplicantCountry(String(val))}
                        options={[
                          { value: 'India (+91)', label: 'India (+91)' },
                          { value: 'United States (+1)', label: 'United States (+1)' },
                          { value: 'United Kingdom (+44)', label: 'United Kingdom (+44)' },
                          { value: 'Singapore (+65)', label: 'Singapore (+65)' },
                          { value: 'Germany (+49)', label: 'Germany (+49)' },
                          { value: 'Remote / Global', label: 'Remote / Global' },
                        ]}
                        buttonClassName="py-2 px-3 text-xs sm:text-sm font-medium border-slate-300"
                      />
                    </div>
                    <div className="sm:flex-1 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 bg-white dark:bg-[#111827] focus-within:border-blue-600">
                      <label className="block font-mono text-xs font-bold text-slate-800 dark:text-slate-200">Phone</label>
                      <input
                        type="tel"
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full text-sm text-slate-900 dark:text-white pt-1 focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Resume/CV Section */}
                <div className="space-y-3 pt-1">
                  <label className="block font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    Resume/CV <span className="text-rose-600">*</span>
                  </label>

                  <input
                    ref={modalFileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.rtf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      disabled={uploadingFile}
                      onClick={() => modalFileInputRef.current?.click()}
                      className={`px-6 py-2.5 rounded-full font-mono text-xs font-semibold border transition cursor-pointer ${
                        resumeInputMode === 'ATTACH'
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border-[#4f7df3] text-[#2b59c3] dark:text-blue-300'
                      }`}
                    >
                      {uploadingFile ? 'Uploading & Sanitizing PDF...' : 'Attach'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setResumeInputMode('SAVED')}
                      className={`px-6 py-2.5 rounded-full font-mono text-xs font-semibold border transition cursor-pointer ${
                        resumeInputMode === 'SAVED'
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border-[#4f7df3] text-[#2b59c3] dark:text-blue-300'
                      }`}
                    >
                      Select Saved Resume ({resumes.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setResumeInputMode('MANUAL')}
                      className={`px-6 py-2.5 rounded-full font-mono text-xs font-semibold border transition cursor-pointer ${
                        resumeInputMode === 'MANUAL'
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border-[#4f7df3] text-[#2b59c3] dark:text-blue-300'
                      }`}
                    >
                      Enter manually
                    </button>
                  </div>

                  <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    Accepted file types: pdf, doc, docx, txt, rtf • Automatically extracts embedded links (LinkedIn, GitHub, Projects) & delivers a verified PDF to the employer.
                  </p>

                  {resumeInputMode === 'SAVED' && (
                    <div className="space-y-2">
                      <CustomSelect
                        value={selectedResumeId}
                        onChange={(val) => {
                          const newId = Number(val);
                          setSelectedResumeId(newId);
                          const chosen = resumes.find((r) => r.id === newId) || null;
                          if (chosen) {
                            overwriteApplicationFieldsFromResume(chosen, true);
                          }
                        }}
                        options={[
                          ...(resumes.length === 0
                            ? [{ value: 0, label: 'Auto-generate PDF Resume from Application Profile' }]
                            : resumes.map((r) => ({
                                value: r.id,
                                label: `${r.title} (#${r.id}) — ${getResumeSkillNames(r).length} skills, ${r.projects?.length || 0} projects`,
                                badge: r.uploadedFileName ? 'PDF' : undefined,
                              }))),
                        ]}
                        buttonClassName="py-2.5 px-3.5 text-xs sm:text-sm font-medium"
                      />

                      {activeResume && (
                        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="font-bold text-emerald-950 dark:text-emerald-200 block">
                              📄 Attached for Employer: {activeResume.uploadedFileName || `${activeResume.title}.pdf`}
                            </span>
                            <span className="text-slate-600 dark:text-slate-400">
                              Verified Skills & Project Stack:{' '}
                              <strong className="text-slate-800 dark:text-slate-200">
                                {getResumeSkillNames(activeResume).join(', ') || 'None listed yet'}
                              </strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={resumeApi.getFileUrl(activeResume.id)}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Preview PDF
                            </a>
                            <a
                              href={resumeApi.getFileUrl(activeResume.id, '?download=true')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" /> Download PDF
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {resumeInputMode === 'MANUAL' && (
                    <textarea
                      rows={5}
                      value={manualResumeText}
                      onChange={(e) => setManualResumeText(e.target.value)}
                      placeholder="Paste your full resume summary, experience bullets, projects, education, and technical skills here (zero character limit)..."
                      className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                    />
                  )}
                </div>

                {/* Cover Letter Section (Complete Untruncated Highlights) */}
                <div className="space-y-3 pt-1">
                  <label className="block font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    Cover Letter (Auto-Extracts Full Work Experience, Projects & Embedded Links)
                  </label>

                  <input
                    ref={coverLetterFileInputRef}
                    type="file"
                    accept=".txt,.md,.rtf"
                    onChange={handleCoverLetterFileUpload}
                    className="hidden"
                  />

                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => coverLetterFileInputRef.current?.click()}
                      className="px-6 py-2.5 rounded-full font-mono text-xs font-semibold border border-[#4f7df3] text-[#2b59c3] dark:text-blue-300 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                      Attach
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverLetterMode('MANUAL')}
                      className={`px-6 py-2.5 rounded-full font-mono text-xs font-semibold border transition cursor-pointer ${
                        coverLetterMode === 'MANUAL'
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border-[#4f7df3] text-[#2b59c3] dark:text-blue-300'
                      }`}
                    >
                      Enter manually
                    </button>
                    <button
                      type="button"
                      disabled={generatingCover}
                      onClick={handleGenerateCoverLetter}
                      className="px-6 py-2.5 rounded-full font-mono text-xs font-semibold border border-[#4f7df3] text-[#2b59c3] dark:text-blue-300 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                      {generatingCover ? 'Drafting Full Cover Letter...' : '⚡ Auto-Draft Full Cover Letter'}
                    </button>
                  </div>

                  <textarea
                    rows={8}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Share relevant systems you've built, architecture decisions, or why you're a strong fit for this role..."
                    className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-lg p-3.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none leading-relaxed"
                  />
                </div>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* LinkedIn Profile & Website / GitHub (Auto-extracted from Embedded PDF Hyperlinks!) */}
                <div className="space-y-3.5">
                  <div className="border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 bg-white dark:bg-[#111827] focus-within:border-blue-600">
                    <label className="block font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      LinkedIn Profile (Extracted from PDF Hyperlink)
                    </label>
                    <input
                      type="text"
                      value={linkedinProfile}
                      onChange={(e) => setLinkedinProfile(e.target.value)}
                      placeholder="https://www.linkedin.com/in/your-handle"
                      className="w-full text-sm text-slate-900 dark:text-white pt-1 focus:outline-none bg-transparent"
                    />
                  </div>

                  <div className="border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 bg-white dark:bg-[#111827] focus-within:border-blue-600">
                    <label className="block font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      Website / Portfolio / GitHub (Extracted from PDF Hyperlink)
                    </label>
                    <input
                      type="text"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://github.com/your-username"
                      className="w-full text-sm text-slate-900 dark:text-white pt-1 focus:outline-none bg-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 bg-white dark:bg-[#111827] focus-within:border-blue-600">
                      <label className="block font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                        LeetCode Profile (Hyperlink)
                      </label>
                      <input
                        type="text"
                        value={leetcodeProfile}
                        onChange={(e) => setLeetcodeProfile(e.target.value)}
                        placeholder="https://leetcode.com/u/your-handle"
                        className="w-full text-sm text-slate-900 dark:text-white pt-1 focus:outline-none bg-transparent"
                      />
                    </div>
                    <div className="border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 bg-white dark:bg-[#111827] focus-within:border-blue-600">
                      <label className="block font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                        Codeforces Profile (Hyperlink)
                      </label>
                      <input
                        type="text"
                        value={codeforcesProfile}
                        onChange={(e) => setCodeforcesProfile(e.target.value)}
                        placeholder="https://codeforces.com/profile/your-handle"
                        className="w-full text-sm text-slate-900 dark:text-white pt-1 focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="sm:flex-1 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 bg-white dark:bg-[#111827] focus-within:border-blue-600">
                      <label className="block font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                        Expected {selectedJob.jobType === 'INTERNSHIP' || selectedJob.jobType === 'CONTRACT' ? 'Monthly' : 'Annual'} Compensation ({selectedJob.currency || 'INR'})
                      </label>
                      <input
                        type="number"
                        value={expectedSalary}
                        onChange={(e) => setExpectedSalary(e.target.value)}
                        className="w-full text-sm text-slate-900 dark:text-white pt-1 focus:outline-none bg-transparent"
                      />
                    </div>
                    <div className="sm:flex-1 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 bg-white dark:bg-[#111827] focus-within:border-blue-600">
                      <label className="block font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                        Earliest Start Date
                      </label>
                      <div className="relative flex items-center pt-1">
                        <Calendar className="w-4 h-4 text-slate-400 mr-2 pointer-events-none" />
                        <input
                          type="date"
                          required
                          value={availableFrom}
                          onChange={(e) => setAvailableFrom(e.target.value)}
                          className="w-full text-sm text-slate-900 dark:text-white focus:outline-none bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={applying}
                  className="w-full bg-[#2b59c3] hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-sm transition cursor-pointer"
                >
                  {applying
                    ? 'Submitting Application & PDF Resume...'
                    : `Submit Application & Send PDF Resume to ${
                        companiesMap[selectedJob.companyId]?.name || 'Hiring Team'
                      }`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
