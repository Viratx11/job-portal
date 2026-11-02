import React, { useEffect, useState } from 'react';
import { getJobById } from '../../services/jobService';
import type { JobResponse } from '../../types/job.types';
import { ApplyModal } from '../../components/candidate/ApplyModal';
import { MapPin, DollarSign, Briefcase, Sparkles, ArrowLeft } from 'lucide-react';

export const JobDetailsPage: React.FC<{ jobId: number; onBack: () => void }> = ({ jobId, onBack }) => {
  const [job, setJob] = useState<JobResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    getJobById(jobId)
      .then((data) => setJob(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) return <div className="text-center py-20 text-slate-500">Loading job details...</div>;
  if (!job) return <div className="text-center py-20 text-rose-400">Job not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200">
        <ArrowLeft className="w-4 h-4" /> Back to Feed
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{job.title}</h1>
            <p className="text-indigo-400 text-sm mt-1">Company ID: {job.companyId}</p>
          </div>
          <button
            onClick={() => setShowApplyModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/20"
          >
            <Sparkles className="w-4 h-4" /> Apply Now
          </button>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400 border-y border-slate-800 py-3">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-indigo-400" /> {job.city}, {job.country}</span>
          <span className="flex items-center gap-1"><Briefcase className="w-4 h-4 text-indigo-400" /> {job.jobType}</span>
          <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-indigo-400" /> {job.minSalary ? `$${job.minSalary}` : 'Competitive'}</span>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-200">Job Description</h2>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>
      </div>

      {showApplyModal && <ApplyModal job={job} onClose={() => setShowApplyModal(false)} />}
    </div>
  );
};