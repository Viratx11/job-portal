import React, { useState } from 'react';
import type { JobResponse } from '../../types/job.types';
import { createApplication } from '../../services/applicationService';
import { X, UploadCloud, Sparkles, CheckCircle2 } from 'lucide-react';

export const ApplyModal: React.FC<{ job: JobResponse; onClose: () => void }> = ({ job, onClose }) => {
  const [resumeId, setResumeId] = useState<string>('1'); // Default resume ID for MVP
  const [coverLetter, setCoverLetter] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await createApplication({
        jobId: job.id,
        resumeId: Number(resumeId),
        coverLetter,
        expectedSalary: expectedSalary ? Number(expectedSalary) : undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application. Check slot locks or backend availability.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-100">Application Submitted!</h3>
            <p className="text-xs text-slate-400">Your application has been locked and queued for AI vector scoring.</p>
            <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg text-xs font-semibold">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-indigo-400 text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Apply for Role
              </span>
              <h2 className="text-lg font-bold text-slate-100">{job.title}</h2>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Resume ID (from profile)</label>
              <input
                type="number"
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Expected Salary ($)</label>
              <input
                type="number"
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(e.target.value)}
                placeholder="120000"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Cover Letter</label>
              <textarea
                rows={3}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Briefly highlight why you fit this role..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {error && <p className="text-rose-400 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition shadow-lg shadow-indigo-600/20"
            >
              {submitting ? 'Submitting...' : 'Confirm Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};