import React, { useEffect, useState } from 'react';
import { MatchScoreBadge } from './MatchScoreBadge';
import { CustomSelect } from '../common/CustomSelect';
import {
  companyApi,
  categoryApi,
  jobSkillApi,
  jobTagApi,
  createJob,
  updateJob,
  getMyJobs,
  publishJob,
  closeJob,
  deleteJob,
  resumeApi,
  applicationApi,
  aiApi,
  type CompanyResponse,
  type JobCategoryResponse,
  type JobSkillResponse,
  type JobTagResponse,
  type JobResponse,
  type ApplicationResponse,
  type ResumeResponse,
  type JobType,
  type WorkMode,
  type ExperienceLevel,
  type CompanySize,
  type CompanyType,
  type IndustryType,
  type ApplicationStatus,
} from '../../services/api';
import {
  Building2,
  PlusCircle,
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  Trash2,
  Tag,
  MessageSquare,
  Star,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  ShieldCheck,
  Pencil,
  Globe,
  Sparkles,
} from 'lucide-react';

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

export const RecruiterDashboard: React.FC = () => {
  const [subTab, setSubTab] = useState<'jobs' | 'company' | 'taxonomy' | 'applicants'>('jobs');
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Data state
  const [company, setCompany] = useState<CompanyResponse | null>(null);
  const [categories, setCategories] = useState<JobCategoryResponse[]>([]);
  const [skills, setSkills] = useState<JobSkillResponse[]>([]);
  const [tags, setTags] = useState<JobTagResponse[]>([]);
  const [myJobs, setMyJobs] = useState<JobResponse[]>([]);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [candidateResumes, setCandidateResumes] = useState<Record<number, ResumeResponse>>({});
  const [openResumeAppId, setOpenResumeAppId] = useState<number | null>(null);

  // Company Form (with Website URL for Avatar & Metadata extraction)
  const [compName, setCompName] = useState('');
  const [compTagline, setCompTagline] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compWebsite, setCompWebsite] = useState('https://github.com');
  const [compEmail, setCompEmail] = useState('talent@gemhire.dev');
  const [compPhone, setCompPhone] = useState('+919876543210');
  const [compYear, setCompYear] = useState('2024');
  const [compSize, setCompSize] = useState<CompanySize>('MEDIUM');
  const [compType, setCompType] = useState<CompanyType>('STARTUP');
  const [compIndustry, setCompIndustry] = useState<IndustryType>('TECHNOLOGY');
  const [aiLoading, setAiLoading] = useState(false);

  // Taxonomy Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newTagName, setNewTagName] = useState('');

  // Job Form (Create + Edit Mode)
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [city, setCity] = useState('Bengaluru');
  const [country, setCountry] = useState('India');
  const [minSalary, setMinSalary] = useState('1200000');
  const [maxSalary, setMaxSalary] = useState('2200000');
  const [jobType, setJobType] = useState<JobType>('FULL_TIME');
  const [workMode, setWorkMode] = useState<WorkMode>('REMOTE');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('MID');
  const [openings, setOpenings] = useState('3');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [benefits, setBenefits] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  // External Job URL Auto-Fill
  const [externalJobUrl, setExternalJobUrl] = useState('');
  const [extractingJobUrl, setExtractingJobUrl] = useState(false);

  // Applicant Screening & Notes
  const [noteInputs, setNoteInputs] = useState<Record<number, string>>({});
  const [aiInsights, setAiInsights] = useState<Record<number, string>>({});

  const notify = (type: 'ok' | 'err', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const resetJobForm = () => {
    setEditingJobId(null);
    setTitle('');
    setExternalJobUrl('');
    setCity('Bengaluru');
    setCountry('India');
    setMinSalary('1200000');
    setMaxSalary('2200000');
    setJobType('FULL_TIME');
    setWorkMode('REMOTE');
    setExperienceLevel('MID');
    setOpenings('3');
    setDescription('');
    setRequirements('');
    setResponsibilities('');
    setBenefits('');
    setSelectedSkills([]);
    setSelectedTags([]);
  };

  const handleExtractJobFromUrl = async () => {
    if (!externalJobUrl.trim()) {
      notify('err', 'Enter a valid job posting URL first.');
      return;
    }
    setExtractingJobUrl(true);
    try {
      const res = await aiApi.extractJobFromUrl(externalJobUrl.trim());
      if (res.title) setTitle(res.title);
      if (res.description) setDescription(res.description);
      if (res.requirements) setRequirements(res.requirements);
      if (res.responsibilities) setResponsibilities(res.responsibilities);
      if (res.benefits) setBenefits(res.benefits);
      if (res.city) setCity(res.city);
      if (res.country) setCountry(res.country);
      if (res.minSalary) setMinSalary(String(res.minSalary));
      if (res.maxSalary) setMaxSalary(String(res.maxSalary));
      if (res.jobType) setJobType(res.jobType);
      if (res.workMode) setWorkMode(res.workMode);
      if (res.experienceLevel) setExperienceLevel(res.experienceLevel);
      if (res.category && categories.length > 0) {
        const found = categories.find((c) => c.name.toLowerCase().includes(res.category.toLowerCase()));
        if (found) setCategoryId(found.id);
      }
      if (Array.isArray(res.skills) && res.skills.length > 0 && skills.length > 0) {
        const matched = skills
          .filter((s) => res.skills.some((sk: string) => sk.toLowerCase() === s.name.toLowerCase()))
          .map((s) => s.id);
        if (matched.length > 0) setSelectedSkills(matched);
      }
      notify('ok', `✨ Auto-filled job details for "${res.title}" from URL! Review and publish.`);
    } catch (err: any) {
      notify('err', err.response?.data?.message || 'Failed to extract job from external URL.');
    } finally {
      setExtractingJobUrl(false);
    }
  };

  const startEditingJob = (job: JobResponse) => {
    setEditingJobId(job.id);
    setTitle(job.title || '');
    setCategoryId(job.category?.id || categories[0]?.id || 0);
    setCity(job.city || 'Bengaluru');
    setCountry(job.country || 'India');
    setMinSalary(job.minSalary != null ? String(job.minSalary) : '1200000');
    setMaxSalary(job.maxSalary != null ? String(job.maxSalary) : '2200000');
    setJobType(job.jobType || 'FULL_TIME');
    setWorkMode(job.workMode || 'REMOTE');
    setExperienceLevel(job.experienceLevel || 'MID');
    setOpenings(job.openings != null ? String(job.openings) : '1');
    setDescription(job.description || '');
    setRequirements(job.requirements || '');
    setResponsibilities(job.responsibilities || '');
    setBenefits(job.benefits || '');
    setSelectedSkills(job.skills ? job.skills.map((s) => s.id) : []);
    setSelectedTags(job.tags ? job.tags.map((t) => t.id) : []);
    setSubTab('jobs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadAll = async () => {
    try {
      const [cats, sks, tgs] = await Promise.all([
        categoryApi.getAllCategories().catch(() => []),
        jobSkillApi.getAllSkills().catch(() => []),
        jobTagApi.getAllTags().catch(() => []),
      ]);
      setCategories(cats);
      if (cats.length > 0 && !categoryId) setCategoryId(cats[0].id);
      setSkills(sks);
      setTags(tgs);
    } catch {
      // ignore
    }

    try {
      const myComp = await companyApi.getMyCompany();
      setCompany(myComp);
      setCompName(myComp.name || '');
      setCompTagline(myComp.tagLine || '');
      setCompDesc(myComp.description || '');
      if (myComp.websiteUrl) setCompWebsite(myComp.websiteUrl);
      if (myComp.email) setCompEmail(myComp.email);
      if (myComp.phone) setCompPhone(myComp.phone);
      if (myComp.foundedYear) setCompYear(String(myComp.foundedYear));
      if (myComp.companySize) setCompSize(myComp.companySize);
      if (myComp.companyType) setCompType(myComp.companyType);
      if (myComp.industryType) setCompIndustry(myComp.industryType);
    } catch {
      setCompany(null);
    }

    try {
      const jobs = await getMyJobs();
      setMyJobs(jobs);
    } catch {
      // ignore
    }

    try {
      const apps = await applicationApi.getApplicationsForCompany();
      setApplications(apps);

      const resumeIds = Array.from(new Set(apps.map((a) => a.resumeId).filter(Boolean)));
      const rMap: Record<number, ResumeResponse> = {};
      await Promise.all(
        resumeIds.map(async (rId) => {
          try {
            const r = await resumeApi.getResume(rId);
            rMap[rId] = r;
          } catch {
            // ignore
          }
        })
      );
      setCandidateResumes(rMap);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleQuickBootstrap = async () => {
    try {
      let currentComp = company;
      if (!currentComp) {
        const normalizedWeb = compWebsite.trim().startsWith('http')
          ? compWebsite.trim()
          : `https://${compWebsite.trim() || 'gemhire.dev'}`;
        currentComp = await companyApi.createCompany({
          name: compName.trim() || 'GemHire Engineering',
          tagline: compTagline.trim() || 'Cloud & Distributed Systems',
          description: compDesc.trim() || 'Core infrastructure and product engineering team.',
          website: normalizedWeb,
          email: compEmail.trim() || 'talent@gemhire.dev',
          phone: compPhone.trim() || '+919876543210',
          foundedYear: Number(compYear) || 2024,
          companySize: 'MEDIUM',
          companyType: 'STARTUP',
          industryType: 'TECHNOLOGY',
        });
        setCompany(currentComp);
      }
      let currentCats = categories;
      if (currentCats.length === 0) {
        const createdCat = await categoryApi.createCategory({
          name: 'Software Engineering',
          description: 'Backend, Frontend, Full-Stack & Systems Roles',
        });
        currentCats = [createdCat];
        setCategories(currentCats);
        setCategoryId(createdCat.id);
      }
      notify('ok', `Configured Company "${currentComp.name}" (#${currentComp.id}) with Website ${currentComp.websiteUrl || compWebsite}.`);
    } catch (err: any) {
      notify('err', err.response?.data?.message || 'Setup failed.');
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const normalizedWeb = compWebsite.trim().startsWith('http')
        ? compWebsite.trim()
        : `https://${compWebsite.trim()}`;
      const payload = {
        name: compName,
        tagline: compTagline,
        description: compDesc,
        website: normalizedWeb,
        email: compEmail,
        phone: compPhone,
        foundedYear: Number(compYear) || 2024,
        companySize: compSize,
        companyType: compType,
        industryType: compIndustry,
      };
      const saved = company
        ? await companyApi.updateCompany(company.id, payload)
        : await companyApi.createCompany(payload);
      setCompany(saved);
      notify('ok', `Company "${saved.name}" saved (#${saved.id}) with avatar domain ${getDomainFromUrl(normalizedWeb) || ''}!`);
    } catch (err: any) {
      notify('err', err.response?.data?.message || 'Failed to save company.');
    }
  };

  const handleExtractCompanyFromUrl = () => {
    const domain = getDomainFromUrl(compWebsite);
    if (!domain) {
      notify('err', 'Enter a valid Company Website URL first (e.g. https://razorpay.com).');
      return;
    }
    const brandRaw = domain.split('.')[0];
    const brandName = brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1);
    if (!compName.trim()) setCompName(brandName);
    if (!compEmail.trim() || compEmail === 'talent@gemhire.dev') setCompEmail(`careers@${domain}`);
    if (!compTagline.trim()) setCompTagline(`Engineering & Product Innovation at ${brandName}`);
    if (!compDesc.trim()) {
      setCompDesc(
        `${brandName} (${compWebsite}) builds high-scale software systems, distributed APIs, and modern user experiences.`
      );
    }
    notify('ok', `Extracted brand avatar & metadata from ${domain}!`);
  };

  const handleAiCompanyDescribe = async () => {
    if (!compName) return notify('err', 'Enter a Company Name first.');
    setAiLoading(true);
    try {
      const [descRes, tagRes] = await Promise.all([
        aiApi.generateCompanyDescription({
          name: compName,
          industry: compIndustry,
          companyType: compType,
          size: compSize,
          tagline: compTagline,
        }),
        aiApi.generateCompanyTaglines({ name: compName, industry: compIndustry, description: compDesc }),
      ]);
      if (descRes?.content) setCompDesc(descRes.content);
      if (tagRes?.taglines?.length) setCompTagline(tagRes.taglines[0]);
      notify('ok', 'Generated company tagline & overview.');
    } catch {
      notify('err', 'Could not reach AI Worker (:8081).');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiFillJob = async () => {
    if (!title) return notify('err', 'Enter a Job Title first.');
    setAiLoading(true);
    try {
      const catName = categories.find((c) => c.id === Number(categoryId))?.name || 'Technology';
      const [desc, reqs, resp, ben, sal] = await Promise.all([
        aiApi.generateJobDescription({ title, experienceLevel, jobType, workMode, category: catName }).catch(() => null),
        aiApi.generateJobRequirements(title, catName).catch(() => null),
        aiApi.generateJobResponsibilities(title, catName).catch(() => null),
        aiApi.generateJobBenefits(title, catName, jobType).catch(() => null),
        aiApi.suggestSalary({ title, experienceLevel, jobType, location: `${city}, ${country}` }).catch(() => null),
      ]);
      if (desc?.content) setDescription(desc.content);
      if (reqs?.content) setRequirements(reqs.content);
      if (resp?.content) setResponsibilities(resp.content);
      if (ben?.content) setBenefits(ben.content);
      if (sal?.minSalary) setMinSalary(String(sal.minSalary));
      if (sal?.maxSalary) setMaxSalary(String(sal.maxSalary));
      notify('ok', 'Drafted description, requirements, responsibilities, benefits & salary range.');
    } catch {
      notify('err', 'Ensure ai-worker-service is running on port 8081.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveOrCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let activeCompany = company;
      if (!activeCompany) {
        const normalizedWeb = compWebsite.trim().startsWith('http')
          ? compWebsite.trim()
          : `https://${compWebsite.trim() || 'gemhire.dev'}`;
        activeCompany = await companyApi.createCompany({
          name: compName.trim() || 'GemHire Corp',
          tagline: compTagline.trim() || 'Engineering & Product',
          description: compDesc.trim() || 'Technology organization.',
          website: normalizedWeb,
          email: compEmail.trim() || 'hr@gemhire.dev',
          phone: compPhone.trim() || '+919876543210',
          foundedYear: 2024,
          companySize: 'MEDIUM',
          companyType: 'STARTUP',
          industryType: 'TECHNOLOGY',
        });
        setCompany(activeCompany);
      }

      let activeCatId = Number(categoryId);
      if (!activeCatId || categories.length === 0) {
        const newCat = await categoryApi.createCategory({
          name: 'Software Engineering',
          description: 'General Engineering',
        });
        setCategories([newCat]);
        activeCatId = newCat.id;
        setCategoryId(newCat.id);
      }

      const payload = {
        title,
        description,
        requirements,
        responsibilities,
        benefits,
        categoryId: activeCatId,
        companyId: activeCompany.id,
        skillIds: selectedSkills.length > 0 ? selectedSkills : undefined,
        tagIds: selectedTags.length > 0 ? selectedTags : undefined,
        city,
        country,
        minSalary: Number(minSalary),
        maxSalary: Number(maxSalary),
        currency: 'INR',
        jobType,
        workMode,
        experienceLevel,
        openings: Number(openings) || 1,
      };

      if (editingJobId) {
        const updated = await updateJob(editingJobId, payload);
        notify('ok', `Updated Job Opening "${updated.title}" (#${updated.id})!`);
      } else {
        const created = await createJob(payload);
        try {
          await publishJob(created.id);
        } catch {
          // already open
        }
        notify('ok', `Job "${created.title}" published to directory!`);
      }

      resetJobForm();
      loadAll();
    } catch (err: any) {
      notify('err', err.response?.data?.message || 'Failed to save job opening.');
    }
  };

  // Include both listed skills and project technologies for candidate fit scoring
  const getResumeSkillsList = (resume?: ResumeResponse): string[] => {
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

  const getResumeExperienceAndProjectsList = (resume?: ResumeResponse): string[] => {
    if (!resume) return [];
    const items: string[] = [];
    if (Array.isArray(resume.workExperiences)) {
      resume.workExperiences.forEach((w: any) => {
        items.push(`${w.jobTitle || 'Engineer'} at ${w.companyName || 'Company'}: ${w.description || ''}`);
      });
    }
    if (Array.isArray(resume.projects)) {
      resume.projects.forEach((p: any) => {
        items.push(
          `Project ${p.title || ''} (${p.technologiesUsed || ''}): ${p.description || ''} ${p.githubUrl || ''} ${p.projectUrl || ''}`
        );
      });
    }
    return items;
  };

  const companyDomain = getDomainFromUrl(company?.websiteUrl || compWebsite);

  return (
    <div className="w-full px-2.5 sm:px-6 lg:px-10 xl:px-14 py-4 sm:py-8 space-y-4 sm:space-y-6 flex-1 min-w-0 overflow-x-hidden">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 rounded-xl shadow-2xs transition-colors">
        <div className="flex items-start gap-3.5 min-w-0">
          {/* Company Avatar derived from Website URL */}
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-display font-bold text-lg flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xs">
            {companyDomain ? (
              <img
                src={`https://www.google.com/s2/favicons?domain=${companyDomain}&sz=128`}
                alt={company?.name || 'Company'}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              (company?.name || compName || 'G')[0].toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Employer ATS & Job Publisher
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5 truncate">
              Hiring & Applicant Tracking
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 break-words">
              {company
                ? `Company: ${company.name} (#${company.id})${company.websiteUrl ? ` • ${company.websiteUrl}` : ''} • ${myJobs.length} Owned Job Openings • ${applications.length} Candidate Submissions`
                : 'Register your Company & Website URL below so your official brand avatar appears on all job listings'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {(!company || categories.length === 0) && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <input
                type="url"
                value={compWebsite}
                onChange={(e) => setCompWebsite(e.target.value)}
                placeholder="Company URL (https://...)"
                className="bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white w-44 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
              />
              <button
                onClick={handleQuickBootstrap}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition cursor-pointer whitespace-nowrap shadow-2xs"
              >
                ⚡ 1-Click Setup
              </button>
            </div>
          )}
          <button
            onClick={() => setSubTab('applicants')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
              subTab === 'applicants'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" /> Applicants ({applications.length})
          </button>
          <button
            onClick={() => setSubTab('jobs')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
              subTab === 'jobs'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Briefcase className="w-4 h-4" /> My Jobs ({myJobs.length})
          </button>
          <button
            onClick={() => setSubTab('company')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
              subTab === 'company'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" /> Company & URL
          </button>
          <button
            onClick={() => setSubTab('taxonomy')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
              subTab === 'taxonomy'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Tag className="w-4 h-4" /> Skills & Categories
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold border shadow-2xs ${
            statusMsg.type === 'ok'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {subTab === 'jobs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
          <form
            onSubmit={handleSaveOrCreateJob}
            className="lg:col-span-7 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-6 space-y-4 shadow-2xs transition-colors"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {editingJobId ? (
                    <>
                      <Pencil className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Editing Job Opening #{editingJobId}
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Publish New Position
                    </>
                  )}
                </h2>
                {editingJobId && (
                  <button
                    type="button"
                    onClick={resetJobForm}
                    className="text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg cursor-pointer transition"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
              <button
                type="button"
                disabled={aiLoading}
                onClick={handleAiFillJob}
                className="bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                {aiLoading ? 'Drafting...' : 'Auto-Draft Role Details →'}
              </button>
            </div>

            <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border border-blue-200/80 dark:border-blue-900/60 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Import & Auto-Fill from External Job Posting URL
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Greenhouse, Lever, LinkedIn, Indeed, Careers Pages
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={externalJobUrl}
                  onChange={(e) => setExternalJobUrl(e.target.value)}
                  placeholder="Paste external job link (e.g. https://job-boards.greenhouse.io/...)"
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
                />
                <button
                  type="button"
                  disabled={extractingJobUrl}
                  onClick={handleExtractJobFromUrl}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 shadow-2xs transition cursor-pointer disabled:opacity-50"
                >
                  {extractingJobUrl ? 'Extracting with AI...' : '⚡ Extract with AI'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                <CustomSelect
                  value={categoryId}
                  onChange={(val) => setCategoryId(Number(val))}
                  options={[
                    ...(categories.length === 0 ? [{ value: 0, label: 'Auto-create "Software Engineering"' }] : []),
                    ...categories.map((c) => ({
                      value: c.id,
                      label: `${c.name} (#${c.id})`,
                    })),
                  ]}
                  placeholder="Select category..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Country *</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Min {jobType === 'INTERNSHIP' || jobType === 'CONTRACT' ? 'Monthly (₹/mo)' : 'Annual (₹/yr)'}
                </label>
                <input
                  type="number"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-mono transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Max {jobType === 'INTERNSHIP' || jobType === 'CONTRACT' ? 'Monthly (₹/mo)' : 'Annual (₹/yr)'}
                </label>
                <input
                  type="number"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-mono transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Job Type</label>
                <CustomSelect
                  value={jobType}
                  onChange={(val) => setJobType(val as JobType)}
                  options={[
                    { value: 'FULL_TIME', label: 'FULL_TIME' },
                    { value: 'PART_TIME', label: 'PART_TIME' },
                    { value: 'CONTRACT', label: 'CONTRACT' },
                    { value: 'INTERNSHIP', label: 'INTERNSHIP' },
                    { value: 'FREELANCE', label: 'FREELANCE' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Work Mode</label>
                <CustomSelect
                  value={workMode}
                  onChange={(val) => setWorkMode(val as WorkMode)}
                  options={[
                    { value: 'REMOTE', label: 'REMOTE' },
                    { value: 'HYBRID', label: 'HYBRID' },
                    { value: 'ON_SITE', label: 'ON_SITE' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Seniority</label>
                <CustomSelect
                  value={experienceLevel}
                  onChange={(val) => setExperienceLevel(val as ExperienceLevel)}
                  options={[
                    { value: 'ENTRY', label: 'ENTRY' },
                    { value: 'JUNIOR', label: 'JUNIOR' },
                    { value: 'MID', label: 'MID' },
                    { value: 'SENIOR', label: 'SENIOR' },
                    { value: 'LEAD', label: 'LEAD' },
                    { value: 'MANAGER', label: 'MANAGER' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Openings Count</label>
                <input
                  type="number"
                  min={1}
                  value={openings}
                  onChange={(e) => setOpenings(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description *</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Role overview, architecture, team..."
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Requirements</label>
                <textarea
                  rows={2}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Responsibilities</label>
                <textarea
                  rows={2}
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Benefits</label>
                <textarea
                  rows={2}
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white transition-colors"
                />
              </div>
            </div>

            {skills.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Attach Required Skills (Used for Unified Candidate & Recruiter Fit Scoring)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => {
                    const active = selectedSkills.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() =>
                          setSelectedSkills((prev) =>
                            active ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                          )
                        }
                        className={`text-xs font-semibold px-3 py-1 rounded-full border cursor-pointer transition ${
                          active
                            ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              className={`w-full font-bold py-3 rounded-xl text-sm shadow-2xs transition cursor-pointer text-white ${
                editingJobId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {editingJobId ? `Save Changes to Job Opening #${editingJobId}` : 'Publish Job Listing'}
            </button>
          </form>

          <div className="lg:col-span-5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-6 space-y-4 shadow-2xs transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Your Owned Job Openings ({myJobs.length})
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Strict ownership enforced — you can only view, edit, close, or delete openings created by your employer account.
                </p>
              </div>
            </div>
            {myJobs.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">No jobs posted by your account yet.</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {myJobs.map((job) => (
                  <div
                    key={job.id}
                    className={`border rounded-xl p-4 space-y-2 transition ${
                      editingJobId === job.id
                        ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{job.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {job.city}, {job.country} • {job.jobType} • {job.workMode} •{' '}
                          <strong className="text-slate-700 dark:text-slate-300">{job.openings || 1} Openings</strong>
                        </p>
                        {job.minSalary != null && (
                          <p className="text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                            ₹{job.minSalary.toLocaleString()} – ₹{(job.maxSalary || job.minSalary).toLocaleString()}{' '}
                            {job.jobType === 'INTERNSHIP' || job.jobType === 'CONTRACT' ? '/ month' : '/ year'}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                          job.status === 'OPEN'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.skills.map((s) => (
                          <span
                            key={s.id}
                            className="text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-700/70">
                      <button
                        type="button"
                        onClick={() => startEditingJob(job)}
                        className="text-xs font-bold bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit Opening
                      </button>
                      {job.status !== 'OPEN' && (
                        <button
                          onClick={() => publishJob(job.id).then(loadAll)}
                          className="text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Publish
                        </button>
                      )}
                      {job.status === 'OPEN' && (
                        <button
                          onClick={() => closeJob(job.id).then(loadAll)}
                          className="text-xs font-bold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Close
                        </button>
                      )}
                      <button
                        onClick={() => deleteJob(job.id).then(loadAll)}
                        className="text-xs font-bold bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-3 py-1 rounded-lg flex items-center gap-1 ml-auto cursor-pointer transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: COMPANY PROFILE & WEBSITE URL AVATAR */}
      {subTab === 'company' && (
        <form onSubmit={handleSaveCompany} className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-6 space-y-5 shadow-2xs transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Company Registration, Website URL & Brand Avatar
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Provide your official Company Website URL so GemHire automatically displays your brand logo/avatar and domain details on all job cards.
              </p>
            </div>
            <button
              type="button"
              disabled={aiLoading}
              onClick={handleAiCompanyDescribe}
              className="bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition"
            >
              Auto-Draft Bio & Tagline →
            </button>
          </div>

          {/* Company Website URL + Live Favicon/Avatar Extractor */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
              {getDomainFromUrl(compWebsite) ? (
                <img
                  src={`https://www.google.com/s2/favicons?domain=${getDomainFromUrl(compWebsite)}&sz=128`}
                  alt="Company Avatar Preview"
                  className="w-9 h-9 object-contain"
                />
              ) : (
                <Globe className="w-6 h-6 text-slate-400 dark:text-slate-500" />
              )}
            </div>
            <div className="flex-1 w-full space-y-1.5 min-w-0">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Company Website URL * (Used for Company Avatar & Verification)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  required
                  value={compWebsite}
                  onChange={(e) => setCompWebsite(e.target.value)}
                  placeholder="https://razorpay.com or https://stripe.com"
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleExtractCompanyFromUrl}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap transition"
                >
                  ⚡ Fetch Avatar & Info from URL
                </button>
              </div>
              {getDomainFromUrl(compWebsite) && (
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold truncate">
                  ✓ Active Avatar Domain: {getDomainFromUrl(compWebsite)}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                placeholder="e.g. Razorpay, Stripe, Zerodha"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tagline</label>
              <input
                type="text"
                value={compTagline}
                onChange={(e) => setCompTagline(e.target.value)}
                placeholder="e.g. Financial Infrastructure for the Internet"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Official Recruiting Email</label>
              <input
                type="email"
                value={compEmail}
                onChange={(e) => setCompEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
              <input
                type="text"
                value={compPhone}
                onChange={(e) => setCompPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Founded Year</label>
              <input
                type="number"
                value={compYear}
                onChange={(e) => setCompYear(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-mono transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Size *</label>
              <CustomSelect
                value={compSize}
                onChange={(val) => setCompSize(val as CompanySize)}
                options={[
                  { value: 'MICRO', label: 'MICRO' },
                  { value: 'SMALL', label: 'SMALL' },
                  { value: 'MEDIUM', label: 'MEDIUM' },
                  { value: 'LARGE', label: 'LARGE' },
                  { value: 'ENTERPRISE', label: 'ENTERPRISE' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Type *</label>
              <CustomSelect
                value={compType}
                onChange={(val) => setCompType(val as CompanyType)}
                options={[
                  { value: 'STARTUP', label: 'STARTUP' },
                  { value: 'PRIVATE', label: 'PRIVATE' },
                  { value: 'PUBLIC_LISTED', label: 'PUBLIC_LISTED' },
                  { value: 'GOVERNMENT', label: 'GOVERNMENT' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Industry *</label>
              <CustomSelect
                value={compIndustry}
                onChange={(val) => setCompIndustry(val as IndustryType)}
                options={[
                  { value: 'TECHNOLOGY', label: 'TECHNOLOGY' },
                  { value: 'FINANCE_BANKING', label: 'FINANCE_BANKING' },
                  { value: 'HEALTHCARE', label: 'HEALTHCARE' },
                  { value: 'EDUCATION', label: 'EDUCATION' },
                  { value: 'CONSULTING', label: 'CONSULTING' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Overview</label>
            <textarea
              rows={4}
              value={compDesc}
              onChange={(e) => setCompDesc(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white transition-colors"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer shadow-2xs transition"
          >
            {company ? 'Update Company & Website Avatar' : 'Register Company & Website Avatar'}
          </button>
        </form>
      )}

      {/* TAB 3: TAXONOMY */}
      {subTab === 'taxonomy' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-2xs transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Categories ({categories.length})</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Distributed Systems"
                className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
              />
              <button
                onClick={async () => {
                  if (!newCatName) return;
                  await categoryApi.createCategory({ name: newCatName, description: newCatDesc });
                  setNewCatName('');
                  setNewCatDesc('');
                  loadAll();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition shadow-2xs"
              >
                Add
              </button>
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg flex justify-between font-medium text-slate-800 dark:text-slate-200"
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-slate-400 dark:text-slate-500 ml-2 shrink-0">#{c.id}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-2xs transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Skills ({skills.length})</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g. Kafka, Rust, Go"
                className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
              />
              <button
                onClick={async () => {
                  if (!newSkillName) return;
                  await jobSkillApi.createSkill({ name: newSkillName, category: 'BACKEND' });
                  setNewSkillName('');
                  loadAll();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition shadow-2xs"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto pr-1">
              {skills.map((s) => (
                <span
                  key={s.id}
                  className="text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-full text-blue-800 dark:text-blue-300"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-2xs transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tags ({tags.length})</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="e.g. FastTrack"
                className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
              />
              <button
                onClick={async () => {
                  if (!newTagName) return;
                  await jobTagApi.createTag({ name: newTagName });
                  setNewTagName('');
                  loadAll();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition shadow-2xs"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto pr-1">
              {tags.map((t) => (
                <span
                  key={t.id}
                  className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full text-slate-700 dark:text-slate-300"
                >
                  #{t.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: APPLICANTS ATS */}
      {subTab === 'applicants' && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-6 space-y-4 shadow-2xs transition-colors">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Candidate Applications & Resume Review
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inspect submitted resumes/PDFs, evaluate unified skill + project fit, generate technical interview questions, and send notes to candidates.
            </p>
          </div>

          {applications.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-8 text-center">No applications received yet.</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const resume = candidateResumes[app.resumeId];
                const resumeSkills = getResumeSkillsList(resume);
                const isResumeOpen = openResumeAppId === app.id;
                const notes = app.notes || [];

                return (
                  <div
                    key={app.id}
                    className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 transition-colors min-w-0"
                  >
                    {/* Top Row */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display text-base font-bold text-slate-900 dark:text-white">
                            {app.candidate?.fullName || `Candidate #${app.candidate?.id || app.id}`}
                          </span>
                          {app.candidate?.email && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">({app.candidate.email})</span>
                          )}
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                            → {app.job?.title || `Job #${app.job?.id}`}
                          </span>
                          <MatchScoreBadge score={app.screening?.overallScore} />
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400 break-words">
                          <span>
                            Resume:{' '}
                            <strong className="text-slate-900 dark:text-white">
                              {resume ? `${resume.title} (#${app.resumeId})` : `Resume #${app.resumeId}`}
                            </strong>
                          </span>
                          {app.expectedSalary && (
                            <span>
                              Expected Salary:{' '}
                              <strong className="text-emerald-700 dark:text-emerald-400 font-mono">
                                ₹{app.expectedSalary.toLocaleString()}
                              </strong>
                            </span>
                          )}
                          {app.availableFrom && (
                            <span>
                              Available From: <strong className="text-slate-900 dark:text-white">{app.availableFrom}</strong>
                            </span>
                          )}
                          {resume?.linkedinUrl && (
                            <a
                              href={resume.linkedinUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-700 dark:text-blue-400 font-semibold hover:underline"
                            >
                              LinkedIn ↗
                            </a>
                          )}
                          {resume?.githubUrl && (
                            <a
                              href={resume.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-900 dark:text-slate-200 font-semibold hover:underline"
                            >
                              GitHub ↗
                            </a>
                          )}
                          <a
                            href={resumeApi.getFileUrl(app.resumeId)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Open Candidate PDF (
                            {resume?.uploadedFileName || `Resume_${app.resumeId}.pdf`})
                          </a>
                          <a
                            href={resumeApi.getFileUrl(app.resumeId, '?download=true')}
                            className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" /> Download PDF
                          </a>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={resumeApi.getFileUrl(app.resumeId, '?download=true')}
                          className="bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                          PDF Resume
                        </a>

                        <button
                          onClick={async () => {
                            if (!isResumeOpen && app.resumeId && !candidateResumes[app.resumeId]) {
                              try {
                                const fetched = await resumeApi.getResume(app.resumeId);
                                setCandidateResumes((prev) => ({ ...prev, [app.resumeId]: fetched }));
                              } catch {
                                notify('err', 'Could not load resume details.');
                              }
                            }
                            setOpenResumeAppId(isResumeOpen ? null : app.id);
                          }}
                          className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          {isResumeOpen ? 'Hide Resume & PDF' : 'View Full Resume & PDF'}
                          {isResumeOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => applicationApi.toggleStar(app.id).then(loadAll)}
                          className={`p-1.5 rounded-lg border cursor-pointer transition ${
                            app.isStarred
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-amber-500'
                          }`}
                          title="Star Candidate"
                        >
                          <Star className="w-4 h-4" />
                        </button>

                        <div className="w-36">
                          <CustomSelect
                            value={app.status}
                            onChange={(val) =>
                              applicationApi
                                .updateStatus(app.id, {
                                  status: val as ApplicationStatus,
                                  note: `Status updated to ${val} by hiring team`,
                                })
                                .then(() => {
                                  notify('ok', `Application status updated to ${val}`);
                                  loadAll();
                                })
                            }
                            options={[
                              { value: 'PENDING', label: 'PENDING' },
                              { value: 'REVIEWED', label: 'REVIEWED' },
                              { value: 'SHORTLISTED', label: 'SHORTLISTED' },
                              { value: 'INTERVIEW_SCHEDULED', label: 'INTERVIEW_SCHEDULED' },
                              { value: 'HIRED', label: 'HIRED' },
                              { value: 'REJECTED', label: 'REJECTED' },
                            ]}
                            buttonClassName="py-1 px-2.5 text-xs font-bold"
                          />
                        </div>

                        <button
                          onClick={async () => {
                            try {
                              const matchedJob = myJobs.find((j) => j.id === app.job?.id);
                              const requiredSkills =
                                matchedJob?.skills && matchedJob.skills.length > 0
                                  ? matchedJob.skills.map((s) => s.name)
                                  : [];

                              let targetResume = resume;
                              if (app.resumeId && !targetResume) {
                                try {
                                  targetResume = await resumeApi.getResume(app.resumeId);
                                  setCandidateResumes((prev) => ({ ...prev, [app.resumeId]: targetResume! }));
                                } catch {
                                  // ignore
                                }
                              }

                              const candSkills = getResumeSkillsList(targetResume);
                              const candExpAndProjects = getResumeExperienceAndProjectsList(targetResume);
                              const candSummary = targetResume?.summary || app.coverLetter || '';

                              const res = await aiApi.scoreCandidate({
                                jobTitle: app.job?.title || matchedJob?.title || 'Software Engineer',
                                candidateSummary: candSummary,
                                candidateSkills: candSkills,
                                candidateExperience: candExpAndProjects,
                                requiredSkills,
                              });

                              const matchedStr = (res.matchedSkills || []).join(', ') || 'None';
                              const missingStr = (res.missingSkills || []).join(', ') || 'None';
                              const projectNames = (targetResume?.projects || [])
                                .map((p: any) => p.title)
                                .filter(Boolean)
                                .join(', ');

                              setApplications((prev) =>
                                prev.map((item) =>
                                  item.id === app.id
                                    ? {
                                        ...item,
                                        screening: {
                                          ...item.screening,
                                          overallScore: res.score,
                                          skillsMatchScore: res.skillsMatchScore,
                                          summary: res.summary,
                                        },
                                      }
                                    : item
                                )
                              );

                              setAiInsights((prev) => ({
                                ...prev,
                                [app.id]: [
                                  `Unified Resume & Project Fit Score: ${res.score}% (${res.score}/100)`,
                                  `Evaluated Resume: ${targetResume?.title || `#${app.resumeId}`} (${candSkills.length} indexed skills + ${targetResume?.projects?.length || 0} engineering projects)`,
                                  projectNames ? `✓ Evaluated Projects: ${projectNames}` : null,
                                  `✓ Matched Skills & Project Stack: ${matchedStr}`,
                                  `✗ Unverified Skills: ${missingStr}`,
                                  `Summary: ${res.summary}`,
                                ]
                                  .filter(Boolean)
                                  .join('\n'),
                              }));
                            } catch {
                              notify('err', 'Ensure ai-worker-service (:8081) is running.');
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition shadow-2xs"
                        >
                          Screen Resume Fit
                        </button>

                        <button
                          onClick={async () => {
                            try {
                              const qRes = await aiApi.generateInterviewQuestions({
                                jobTitle: app.job?.title || 'Software Engineer',
                                interviewType: 'TECHNICAL',
                              });

                              const formatted = (qRes?.questions || [])
                                .map((q: any, idx: number) => {
                                  const diff = q.difficulty || 'Medium';
                                  const cat = q.category || 'Technical';
                                  const text =
                                    q.question ||
                                    q.text ||
                                    `Explain your architecture approach for ${app.job?.title || 'this role'}.`;
                                  return `${idx + 1}. [${diff} • ${cat}] ${text}`;
                                })
                                .join('\n\n');

                              setAiInsights((prev) => ({
                                ...prev,
                                [app.id]: formatted || 'No questions generated.',
                              }));
                            } catch {
                              notify('err', 'Ensure ai-worker-service (:8081) is running.');
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition shadow-2xs"
                        >
                          Interview Qs
                        </button>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    {app.coverLetter && (
                      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                          Candidate Cover Note
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed break-words">
                          {app.coverLetter}
                        </p>
                      </div>
                    )}

                    {/* Expandable Full Candidate Resume + Inline PDF Viewer Panel */}
                    {isResumeOpen && (
                      <div className="bg-white dark:bg-[#111827] border border-blue-200 dark:border-blue-900/50 rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                Candidate Resume & Verified PDF Document
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Prompt-Injection Sanitized
                              </span>
                            </div>
                            <h4 className="font-display text-base font-bold text-slate-900 dark:text-white">
                              {resume?.title || `Resume #${app.resumeId}`}
                            </h4>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={resumeApi.getFileUrl(app.resumeId)}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Open PDF in New Tab
                            </a>
                            <a
                              href={resumeApi.getFileUrl(app.resumeId, '?download=true')}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 transition shadow-2xs"
                            >
                              <Download className="w-3.5 h-3.5" /> Download Candidate PDF (
                              {resume?.uploadedFileName || `Resume_${app.resumeId}.pdf`})
                            </a>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 text-xs">
                          {/* Left: Structured Resume Sheet */}
                          <div className="xl:col-span-6 space-y-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4">
                            <div>
                              <span className="text-slate-700 dark:text-slate-300 font-bold block mb-1.5">
                                Verified Technical & Project Skills ({resumeSkills.length})
                              </span>
                              {resumeSkills.length === 0 ? (
                                <span className="text-slate-400 dark:text-slate-500">No skills listed on this resume.</span>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                  {resumeSkills.map((sk, i) => (
                                    <span
                                      key={i}
                                      className="font-semibold text-xs bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 px-2.5 py-0.5 rounded-md"
                                    >
                                      {sk}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {resume?.projects && resume.projects.length > 0 && (
                              <div>
                                <span className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                                  Engineering Projects ({resume.projects.length})
                                </span>
                                <div className="space-y-1.5">
                                  {resume.projects.map((p: any) => (
                                    <div key={p.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg space-y-1">
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <strong className="text-slate-900 dark:text-white">{p.title}</strong>
                                        <div className="flex items-center gap-2">
                                          {p.githubUrl && (
                                            <a
                                              href={p.githubUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                            >
                                              GitHub ↗
                                            </a>
                                          )}
                                          {p.projectUrl && (
                                            <a
                                              href={p.projectUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                                            >
                                              Live Demo ↗
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                      {p.technologiesUsed && (
                                        <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                                          Stack: {p.technologiesUsed}
                                        </div>
                                      )}
                                      {p.description && (
                                        <p className="text-[11px] text-slate-600 dark:text-slate-400 whitespace-pre-line">{p.description}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {resume?.summary && (
                              <div>
                                <span className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                                  Full Extracted Resume Text & Embedded Links
                                </span>
                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-700 dark:text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed break-words">
                                  {resume.summary}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right: Embedded Live PDF Document Preview */}
                          <div className="xl:col-span-6 space-y-2">
                            <span className="text-slate-700 dark:text-slate-300 font-bold block">
                              Embedded PDF Resume Preview (Company Copy)
                            </span>
                            <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-900 h-80">
                              <iframe
                                src={resumeApi.getFileUrl(app.resumeId)}
                                title={`Candidate Resume PDF #${app.resumeId}`}
                                className="w-full h-full border-0 bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Screening / Interview Qs Output */}
                    {aiInsights[app.id] && (
                      <pre className="text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900/90 border border-blue-200 dark:border-blue-900/60 p-4 rounded-xl whitespace-pre-wrap leading-relaxed shadow-2xs break-words">
                        {aiInsights[app.id]}
                      </pre>
                    )}

                    {/* Recruiter Notes */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 space-y-2.5">
                      {notes.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                            Sent Notes (Visible to Candidate in My Applications)
                          </span>
                          {notes.map((n) => (
                            <div
                              key={n.id}
                              className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3.5 py-2 flex justify-between items-center gap-2 text-xs"
                            >
                              <div className="min-w-0 flex-1">
                                <span className="font-medium text-slate-900 dark:text-slate-100 break-words">{n.content}</span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-2 whitespace-nowrap">
                                  {new Date(n.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <button
                                onClick={() => applicationApi.deleteNote(app.id, n.id).then(loadAll)}
                                className="text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 text-xs cursor-pointer transition shrink-0"
                                title="Delete Note"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                        <input
                          type="text"
                          placeholder="Write an evaluation note or interview instruction for the candidate..."
                          value={noteInputs[app.id] || ''}
                          onChange={(e) =>
                            setNoteInputs((prev) => ({ ...prev, [app.id]: e.target.value }))
                          }
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter' && noteInputs[app.id]?.trim()) {
                              e.preventDefault();
                              await applicationApi.addNote(app.id, noteInputs[app.id].trim());
                              setNoteInputs((prev) => ({ ...prev, [app.id]: '' }));
                              notify('ok', 'Note saved & shared with candidate!');
                              loadAll();
                            }
                          }}
                          className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                        />
                        <button
                          onClick={async () => {
                            const content = noteInputs[app.id]?.trim();
                            if (!content) return;
                            await applicationApi.addNote(app.id, content);
                            setNoteInputs((prev) => ({ ...prev, [app.id]: '' }));
                            notify('ok', 'Note saved & shared with candidate!');
                            loadAll();
                          }}
                          className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Send Note to Candidate
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
