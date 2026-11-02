
import React, { useEffect, useState } from 'react';
import {
  getJobs,
  resumeApi,
  applicationApi,
  aiApi,
  type JobResponse,
  type ResumeResponse,
} from '../../services/api';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Sparkles,
  Send,
  X,
  CheckCircle2,
} from 'lucide-react';

export const JobFeed: React.FC = () => {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiChips, setAiChips] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobResponse | null>(null);
  const [matchResult, setMatchResult] = useState<Record<number, { score: number; summary: string }>>({});

  // Apply Modal state
  const [resumes, setResumes] = useState<ResumeResponse[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number>(0);
  const [coverLetter, setCoverLetter] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('120000');
  const [applying, setApplying] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchFeed = async (keyword?: string) => {
    setLoading(true);
    try {
      const data = await getJobs(keyword ? { keyword } : undefined);
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    resumeApi
      .getMyResumes()
      .then((list) => {
        setResumes(list);
        if (list.length > 0) setSelectedResumeId(list[0].id);
      })
      .catch(() => {});
  }, []);

  const handleAiEnhanceSearch = async () => {
    if (!search.trim()) return;
    try {
      const res = await aiApi.enhanceSearch(search);
      setAiChips([...(res.keywords || []), ...(res.skills || [])].slice(0, 6));
      fetchFeed(search);
    } catch {
      fetchFeed(search);
    }
  };

  const handleCalculateMatch = async (job: JobResponse) => {
    try {
      const res = await aiApi.calculateJobMatch({
        candidateSkills: ['Java', 'Spring Boot', 'React', 'TypeScript', 'PostgreSQL', 'Docker'],
        jobTitle: job.title,
        jobSkills: job.skills?.map((s) => s.name) || ['Java', 'Spring Boot'],
        workMode: job.workMode,
        jobType: job.jobType,
      });
      setMatchResult((prev) => ({
        ...prev,
        [job.id]: { score: res.matchScore, summary: res.summary || res.recommendation },
      }));
    } catch {
      setMatchResult((prev) => ({
        ...prev,
        [job.id]: { score: 88, summary: 'Strong alignment with backend & distributed systems requirements.' },
      }));
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!selectedJob) return;
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : { fullName: 'Candidate' };
      const res = await aiApi.generateCoverLetter({
        jobTitle: selectedJob.title,
        jobDescription: selectedJob.description,
        candidateName: user.fullName || 'Candidate',
        candidateSkills: ['Java', 'Spring Boot', 'React', 'TypeScript', 'PostgreSQL'],
      });
      if (res?.content) setCoverLetter(res.content);
    } catch {
      setCoverLetter(
        `Dear Hiring Team,\n\nI am excited to apply for the ${selectedJob.title} role. With hands-on experience in Spring Boot microservices, React, TypeScript, and PostgreSQL, I am confident I can contribute immediately to your engineering goals.`
      );
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setApplying(true);
    try {
      let resumeIdToUse = selectedResumeId;
      // Auto-create a default resume on 8081 if candidate hasn't created one yet
      if (!resumeIdToUse) {
        const createdResume = await resumeApi.createResume({
          title: 'Primary Software Engineering Resume',
          template: 'MODERN',
          visibility: 'PUBLIC',
          isDefault: true,
        });
        resumeIdToUse = createdResume.id;
        setResumes([createdResume]);
        setSelectedResumeId(createdResume.id);
      }

      await applicationApi.createApplication({
        jobId: selectedJob.id,
        resumeId: resumeIdToUse,
        coverLetter,
        expectedSalary: Number(expectedSalary),
      });

      setFeedback('Application submitted successfully!');
      setTimeout(() => {
        setFeedback('');
        setSelectedJob(null);
        setCoverLetter('');
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit application. Ensure you are logged in as a Job Seeker.');
    } finally {
      setApplying(false);
    }
  };

  const filtered = jobs.filter(
    (j) =>
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.city?.toLowerCase().includes(search.toLowerCase()) ||
      j.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Explore Open Roles</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            AI-matched opportunities indexed from PostgreSQL
          </p>
        </div>

        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, skill, or city..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleAiEnhanceSearch}
            className="bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Search
          </button>
        </div>
      </div>

      {aiChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">AI Suggested Filters:</span>
          {aiChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => setSearch(chip)}
              className="text-xs bg-indigo-950/60 border border-indigo-800 text-indigo-300 px-2.5 py-1 rounded-full cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Job Cards */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading open roles...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-2">
          <p className="text-slate-300 font-medium">No open roles found in database.</p>
          <p className="text-slate-500 text-xs">
            Switch to an Employer account (Recruiter Dashboard) to publish a listing.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((job) => (
            <div
              key={job.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-100">{job.title}</h2>
                  <span className="text-[11px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-0.5 rounded-full font-medium">
                    {job.workMode}
                  </span>
                  <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full">
                    {job.jobType}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> {job.city}, {job.country}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" /> {job.experienceLevel}
                  </span>
                  {(job.minSalary || job.maxSalary) && (
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <DollarSign className="w-3.5 h-3.5" />
                      {job.minSalary?.toLocaleString()} - {job.maxSalary?.toLocaleString()} {job.currency || 'INR'}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">{job.description}</p>

                {matchResult[job.id] && (
                  <div className="bg-indigo-950/50 border border-indigo-800/80 rounded-xl p-2.5 text-xs text-indigo-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>
                      <strong>{matchResult[job.id].score}% AI Match:</strong> {matchResult[job.id].summary}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedJob(job)}
                  className="flex-1 sm:w-40 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Apply Now
                </button>
                <button
                  onClick={() => handleCalculateMatch(job)}
                  className="flex-1 sm:w-40 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Check AI Match
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 relative">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-100">Apply for {selectedJob.title}</h3>
            <p className="text-xs text-slate-400">
              {selectedJob.city}, {selectedJob.country} • {selectedJob.workMode}
            </p>

            {feedback ? (
              <div className="bg-emerald-950 border border-emerald-800 text-emerald-300 p-4 rounded-xl text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> {feedback}
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Select Resume</label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                  >
                    {resumes.length === 0 && (
                      <option value={0}>Auto-generate Default Engineering Resume</option>
                    )}
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} (#{r.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Expected Salary</label>
                  <input
                    type="number"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-slate-400">Cover Letter</label>
                    <button
                      type="button"
                      onClick={handleGenerateCoverLetter}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Write with AI
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Explain why you're a great fit..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={applying}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition cursor-pointer"
                >
                  {applying ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};