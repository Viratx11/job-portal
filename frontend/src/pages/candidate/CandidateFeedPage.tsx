import React, { useEffect, useState } from 'react';
import { getJobs } from '../../services/jobService';
import type { JobResponse } from '../../types/job.types';
import { ApplyModal } from '../../components/candidate/ApplyModal';
import { MapPin, DollarSign, Search, Sparkles, Building2 } from 'lucide-react';

export const CandidateFeedPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobResponse | null>(null);

  useEffect(() => {
    getJobs()
      .then((data) => setJobs(data))
      .catch((err) => console.error('Failed to fetch jobs', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Explore Open Roles</h1>
          <p className="text-slate-400 text-sm">AI-matched opportunities indexed from PostgreSQL</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search title or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Connecting to core-service (:8080)...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <p className="text-slate-400 font-medium">No open roles found in database.</p>
          <p className="text-slate-500 text-xs mt-1">Switch to Recruiter Dashboard to publish a listing.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">{job.title}</h2>
                  <p className="text-indigo-400 text-sm font-medium flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> Company #{job.companyId}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedJob(job)}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Apply with AI Match
                </button>
              </div>
              <p className="text-slate-300 text-sm mt-3 line-clamp-2">{job.description}</p>
              <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.city}, {job.country}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {job.minSalary ? `$${job.minSalary} - $${job.maxSalary}` : 'Competitive'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedJob && <ApplyModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  );
};