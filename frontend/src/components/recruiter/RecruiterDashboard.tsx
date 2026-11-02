
import React, { useEffect, useState } from 'react';
import {
  companyApi,
  categoryApi,
  jobSkillApi,
  jobTagApi,
  createJob,
  getMyJobs,
  publishJob,
  closeJob,
  deleteJob,
  applicationApi,
  aiApi,
  type CompanyResponse,
  type JobCategoryResponse,
  type JobSkillResponse,
  type JobTagResponse,
  type JobResponse,
  type ApplicationResponse,
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
  Sparkles,
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  Trash2,
  Tag,
  MessageSquare,
  Star,
} from 'lucide-react';

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

  // Company Form
  const [compName, setCompName] = useState('');
  const [compTagline, setCompTagline] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compWebsite, setCompWebsite] = useState('https://nexuscorp.io');
  const [compEmail, setCompEmail] = useState('hr@nexuscorp.io');
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

  // Job Form
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [city, setCity] = useState('Agartala');
  const [country, setCountry] = useState('India');
  const [minSalary, setMinSalary] = useState('90000');
  const [maxSalary, setMaxSalary] = useState('160000');
  const [jobType, setJobType] = useState<JobType>('FULL_TIME');
  const [workMode, setWorkMode] = useState<WorkMode>('REMOTE');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('MID');
  const [openings, setOpenings] = useState('2');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [benefits, setBenefits] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  // Applicant AI & Notes
  const [noteInputs, setNoteInputs] = useState<Record<number, string>>({});
  const [aiInsights, setAiInsights] = useState<Record<number, string>>({});

  const notify = (type: 'ok' | 'err', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
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
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ── Quick Bootstrap (Creates Default Company + Category in 1 Click!) ──────
  const handleQuickBootstrap = async () => {
    try {
      let currentComp = company;
      if (!currentComp) {
        currentComp = await companyApi.createCompany({
          name: compName || 'NexusHire Technologies',
          tagline: 'Distributed AI Recruitment Platform',
          description: 'Cloud-native engineering and AI talent platform.',
          website: 'https://nexushire.dev',
          email: 'talent@nexushire.dev',
          phone: '+919876543210',
          foundedYear: 2025,
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
          description: 'Backend, Frontend, Full-Stack & AI Roles',
        });
        currentCats = [createdCat];
        setCategories(currentCats);
        setCategoryId(createdCat.id);
      }
      notify('ok', `Ready! Company "${currentComp.name}" (ID #${currentComp.id}) & Category #${currentCats[0].id} configured.`);
    } catch (err: any) {
      notify('err', err.response?.data?.message || 'Bootstrap failed. Make sure you are logged in as ROLE_EMPLOYER.');
    }
  };

  // ── Save Company ──────────────────────────────────────────────────────────
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: compName,
        tagline: compTagline,
        description: compDesc,
        website: compWebsite,
        email: compEmail,
        phone: compPhone,
        foundedYear: Number(compYear),
        companySize: compSize,
        companyType: compType,
        industryType: compIndustry,
      };
      const saved = company
        ? await companyApi.updateCompany(company.id, payload)
        : await companyApi.createCompany(payload);
      setCompany(saved);
      notify('ok', `Company "${saved.name}" saved (ID #${saved.id})!`);
    } catch (err: any) {
      notify('err', err.response?.data?.message || 'Failed to save company.');
    }
  };

  // ── AI Company Helpers ────────────────────────────────────────────────────
  const handleAiCompanyDescribe = async () => {
    if (!compName) return notify('err', 'Enter a Company Name first.');
    setAiLoading(true);
    try {
      const [descRes, tagRes] = await Promise.all([
        aiApi.generateCompanyDescription({ name: compName, industry: compIndustry, companyType: compType, size: compSize, tagline: compTagline }),
        aiApi.generateCompanyTaglines({ name: compName, industry: compIndustry, description: compDesc }),
      ]);
      if (descRes?.content) setCompDesc(descRes.content);
      if (tagRes?.taglines?.length) setCompTagline(tagRes.taglines[0]);
      notify('ok', 'AI generated company tagline & description!');
    } catch {
      notify('err', 'AI Worker (:8081) unavailable or Gemini key not set.');
    } finally {
      setAiLoading(false);
    }
  };

  // ── AI Job Helpers ────────────────────────────────────────────────────────
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
      notify('ok', 'AI populated description, requirements, responsibilities, benefits & salary range!');
    } catch {
      notify('err', 'Ensure ai-worker-service is running on port 8081.');
    } finally {
      setAiLoading(false);
    }
  };

  // ── Create & Auto-Publish Job ─────────────────────────────────────────────
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let activeCompany = company;
      if (!activeCompany) {
        activeCompany = await companyApi.createCompany({
          name: 'NexusHire Corp',
          tagline: 'AI Engineering',
          description: 'Auto-created employer company profile.',
          website: 'https://nexushire.dev',
          email: 'hr@nexushire.dev',
          phone: '+919876543210',
          foundedYear: 2025,
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

      const created = await createJob({
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
        openings: Number(openings),
      });

      // Automatically publish so it appears immediately on the public Job Feed
      try {
        await publishJob(created.id);
      } catch {
        // already open or published
      }

      notify('ok', `Job "${created.title}" created & published to live feed!`);
      setTitle('');
      setDescription('');
      setRequirements('');
      setResponsibilities('');
      setBenefits('');
      loadAll();
    } catch (err: any) {
      notify('err', err.response?.data?.message || 'Failed to post job. Check backend logs.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Employer Command Center</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            {company
              ? `Active Company: ${company.name} (ID #${company.id}) • ${categories.length} Categories`
              : 'No company linked yet — click "1-Click Setup" or configure in Company Profile'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {(!company || categories.length === 0) && (
            <button
              onClick={handleQuickBootstrap}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition cursor-pointer"
            >
              ⚡ 1-Click Setup Company & Category
            </button>
          )}
          <button
            onClick={() => setSubTab('jobs')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              subTab === 'jobs' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Jobs ({myJobs.length})
          </button>
          <button
            onClick={() => setSubTab('company')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              subTab === 'company' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Company Profile
          </button>
          <button
            onClick={() => setSubTab('taxonomy')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              subTab === 'taxonomy' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Tag className="w-3.5 h-3.5" /> Categories & Skills
          </button>
          <button
            onClick={() => setSubTab('applicants')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              subTab === 'applicants' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Applicants ({applications.length})
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-sm border ${
            statusMsg.type === 'ok'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* TAB 1: JOBS & AI JOB PUBLISHER */}
      {subTab === 'jobs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleCreateJob}
            className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-400" /> Post New Job Opening
              </h2>
              <button
                type="button"
                disabled={aiLoading}
                onClick={handleAiFillJob}
                className="flex items-center gap-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiLoading ? 'Generating with AI...' : 'Auto-Fill with AI Worker'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems Engineer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Job Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100"
                >
                  {categories.length === 0 && <option value={0}>Auto-create "Software Engineering"</option>}
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (#{c.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Country *</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Min Salary</label>
                <input
                  type="number"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Max Salary</label>
                <input
                  type="number"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Job Type</label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value as JobType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-100"
                >
                  <option value="FULL_TIME">FULL_TIME</option>
                  <option value="PART_TIME">PART_TIME</option>
                  <option value="CONTRACT">CONTRACT</option>
                  <option value="INTERNSHIP">INTERNSHIP</option>
                  <option value="FREELANCE">FREELANCE</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Work Mode</label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-100"
                >
                  <option value="REMOTE">REMOTE</option>
                  <option value="HYBRID">HYBRID</option>
                  <option value="ON_SITE">ON_SITE</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Experience</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-100"
                >
                  <option value="ENTRY">ENTRY</option>
                  <option value="JUNIOR">JUNIOR</option>
                  <option value="MID">MID</option>
                  <option value="SENIOR">SENIOR</option>
                  <option value="LEAD">LEAD</option>
                  <option value="MANAGER">MANAGER</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Openings</label>
                <input
                  type="number"
                  min={1}
                  value={openings}
                  onChange={(e) => setOpenings(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Description *</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Role overview, team architecture, impact..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Requirements</label>
                <textarea
                  rows={2}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Responsibilities</label>
                <textarea
                  rows={2}
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Benefits</label>
                <textarea
                  rows={2}
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition cursor-pointer"
            >
              Publish Job Opening
            </button>
          </form>

          {/* Employer's Posted Jobs List */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-base font-bold text-slate-100">Your Posted Jobs ({myJobs.length})</h2>
            {myJobs.length === 0 ? (
              <p className="text-xs text-slate-400">No jobs posted yet. Use the form on the left to publish one!</p>
            ) : (
              <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                {myJobs.map((job) => (
                  <div key={job.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-100">{job.title}</h3>
                        <p className="text-xs text-slate-400">
                          {job.city}, {job.country} • {job.jobType} • {job.workMode}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          job.status === 'OPEN'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      {job.status !== 'OPEN' && (
                        <button
                          onClick={() => publishJob(job.id).then(loadAll)}
                          className="text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Publish
                        </button>
                      )}
                      {job.status === 'OPEN' && (
                        <button
                          onClick={() => closeJob(job.id).then(loadAll)}
                          className="text-xs bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Close
                        </button>
                      )}
                      <button
                        onClick={() => deleteJob(job.id).then(loadAll)}
                        className="text-xs bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 px-2.5 py-1 rounded-md flex items-center gap-1 ml-auto cursor-pointer"
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

      {/* TAB 2: COMPANY PROFILE (/api/companies + /api/ai/company) */}
      {subTab === 'company' && (
        <form onSubmit={handleSaveCompany} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Company Profile Management</h2>
              <p className="text-xs text-slate-400">Required before posting jobs (`POST /api/companies`)</p>
            </div>
            <button
              type="button"
              disabled={aiLoading}
              onClick={handleAiCompanyDescribe}
              className="flex items-center gap-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> Generate Tagline & Bio with AI
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                placeholder="NexusHire Labs"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tagline</label>
              <input
                type="text"
                value={compTagline}
                onChange={(e) => setCompTagline(e.target.value)}
                placeholder="AI-First Talent Matching"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Company Size *</label>
              <select
                value={compSize}
                onChange={(e) => setCompSize(e.target.value as CompanySize)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
              >
                <option value="MICRO">MICRO</option>
                <option value="SMALL">SMALL</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LARGE">LARGE</option>
                <option value="ENTERPRISE">ENTERPRISE</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Company Type *</label>
              <select
                value={compType}
                onChange={(e) => setCompType(e.target.value as CompanyType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
              >
                <option value="STARTUP">STARTUP</option>
                <option value="PRIVATE">PRIVATE</option>
                <option value="PUBLIC_LISTED">PUBLIC_LISTED</option>
                <option value="GOVERNMENT">GOVERNMENT</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Industry Type *</label>
              <select
                value={compIndustry}
                onChange={(e) => setCompIndustry(e.target.value as IndustryType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
              >
                <option value="TECHNOLOGY">TECHNOLOGY</option>
                <option value="FINANCE_BANKING">FINANCE_BANKING</option>
                <option value="HEALTHCARE">HEALTHCARE</option>
                <option value="EDUCATION">EDUCATION</option>
                <option value="CONSULTING">CONSULTING</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Website URL (http/https)</label>
              <input
                type="url"
                value={compWebsite}
                onChange={(e) => setCompWebsite(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Company Email</label>
              <input
                type="email"
                value={compEmail}
                onChange={(e) => setCompEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Founded Year</label>
              <input
                type="number"
                value={compYear}
                onChange={(e) => setCompYear(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Company Description</label>
            <textarea
              rows={4}
              value={compDesc}
              onChange={(e) => setCompDesc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100"
            />
          </div>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-lg text-sm cursor-pointer"
          >
            {company ? 'Update Company Profile' : 'Create Company Profile'}
          </button>
        </form>
      )}

      {/* TAB 3: TAXONOMY (/api/job-categories, /api/job-skills, /api/job-tags) */}
      {subTab === 'taxonomy' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Categories */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Job Categories ({categories.length})</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Backend Engineering"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
              />
              <button
                onClick={async () => {
                  if (!newCatName) return;
                  await categoryApi.createCategory({ name: newCatName, description: newCatDesc });
                  setNewCatName('');
                  loadAll();
                }}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Add
              </button>
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {categories.map((c) => (
                <div key={c.id} className="text-xs bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg flex justify-between">
                  <span>{c.name}</span>
                  <span className="text-slate-500">#{c.id}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Job Skills ({skills.length})</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g. Spring Boot / Kafka"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
              />
              <button
                onClick={async () => {
                  if (!newSkillName) return;
                  await jobSkillApi.createSkill({ name: newSkillName, category: 'BACKEND' });
                  setNewSkillName('');
                  loadAll();
                }}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto">
              {skills.map((s) => (
                <span key={s.id} className="text-xs bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-full text-indigo-300">
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Job Tags ({tags.length})</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="e.g. UrgentHiring"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
              />
              <button
                onClick={async () => {
                  if (!newTagName) return;
                  await jobTagApi.createTag({ name: newTagName });
                  setNewTagName('');
                  loadAll();
                }}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto">
              {tags.map((t) => (
                <span key={t.id} className="text-xs bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-full text-emerald-300">
                  #{t.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: APPLICANTS ATS & AI SCREENING (/api/applications + /api/ai/application) */}
      {subTab === 'applicants' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-base font-bold text-slate-100">Candidate Applications & AI Screening</h2>
          {applications.length === 0 ? (
            <p className="text-xs text-slate-400">No applications received yet.</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-100">
                          {app.candidate?.fullName || `Candidate #${app.candidate?.id || app.id}`}
                        </span>
                        <span className="text-xs text-indigo-400 font-medium">
                          → {app.job?.title || `Job #${app.job?.id}`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Resume #{app.resumeId} • Status: <strong className="text-slate-200">{app.status}</strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => applicationApi.toggleStar(app.id).then(loadAll)}
                        className={`p-1.5 rounded-lg border cursor-pointer ${
                          app.isStarred ? 'bg-amber-950 border-amber-700 text-amber-400' : 'border-slate-800 text-slate-400'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <select
                        value={app.status}
                        onChange={(e) =>
                          applicationApi
                            .updateStatus(app.id, { status: e.target.value as ApplicationStatus })
                            .then(loadAll)
                        }
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="REVIEWED">REVIEWED</option>
                        <option value="SHORTLISTED">SHORTLISTED</option>
                        <option value="INTERVIEW_SCHEDULED">INTERVIEW_SCHEDULED</option>
                        <option value="HIRED">HIRED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                      <button
                        onClick={async () => {
                          try {
                            const res = await aiApi.scoreCandidate({
                              jobTitle: app.job?.title || 'Software Engineer',
                              candidateSummary: app.coverLetter || 'Experienced full-stack candidate',
                              candidateSkills: ['Java', 'Spring Boot', 'React', 'PostgreSQL'],
                              requiredSkills: ['Java', 'Spring Boot', 'Kafka', 'Redis'],
                            });
                            setAiInsights((prev) => ({
                              ...prev,
                              [app.id]: `AI Match Score: ${res.score}/100 | Skills: ${res.skillsMatchScore}% — ${res.summary}`,
                            }));
                          } catch {
                            notify('err', 'Ensure ai-worker-service (:8081) is running.');
                          }
                        }}
                        className="bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-700 text-indigo-300 px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> AI Screen
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const qRes = await aiApi.generateInterviewQuestions({
                              jobTitle: app.job?.title || 'Software Engineer',
                              interviewType: 'TECHNICAL',
                            });
                            const formatted = qRes.questions?.map((q) => `• [${q.difficulty}] ${q.question}`).join('\n');
                            setAiInsights((prev) => ({ ...prev, [app.id]: formatted || 'Generated questions.' }));
                          } catch {
                            notify('err', 'Ensure ai-worker-service (:8081) is running.');
                          }
                        }}
                        className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-700 text-emerald-300 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer"
                      >
                        AI Interview Qs
                      </button>
                    </div>
                  </div>

                  {app.coverLetter && (
                    <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800">
                      {app.coverLetter}
                    </p>
                  )}

                  {aiInsights[app.id] && (
                    <pre className="text-xs text-indigo-200 bg-indigo-950/40 border border-indigo-800/80 p-3 rounded-lg whitespace-pre-wrap font-sans">
                      {aiInsights[app.id]}
                    </pre>
                  )}

                  {/* Application Notes (/api/applications/{id}/notes) */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                    <input
                      type="text"
                      placeholder="Add recruiter evaluation note..."
                      value={noteInputs[app.id] || ''}
                      onChange={(e) => setNoteInputs((prev) => ({ ...prev, [app.id]: e.target.value }))}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                    />
                    <button
                      onClick={async () => {
                        const content = noteInputs[app.id];
                        if (!content) return;
                        await applicationApi.addNote(app.id, content);
                        setNoteInputs((prev) => ({ ...prev, [app.id]: '' }));
                        notify('ok', 'Recruiter note added!');
                        loadAll();
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Add Note
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
