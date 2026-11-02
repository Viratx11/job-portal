import React, { useEffect, useState } from 'react';
import { getApplicationsForJob } from '../../services/applicationService';
import type { ApplicationResponse } from '../../types/application.types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MatchScoreBadge } from '../../components/recruiter/MatchScoreBadge';
import { ArrowLeft, User, Mail, FileText } from 'lucide-react';

export const JobApplicantsPage: React.FC<{ jobId: number; onBack: () => void }> = ({ jobId, onBack }) => {
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApplicationsForJob(jobId)
      .then((data) => setApplications(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [jobId]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-100">Applicants Pipeline</h1>
        <p className="text-slate-400 text-sm">Ranked dynamically by AI vector match score</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading applicants...</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <p className="text-slate-400 font-medium">No candidates have applied to this job yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" /> {app.candidate?.fullName || 'Candidate'}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {app.candidate?.email}
                </p>
                {app.coverLetter && (
                  <p className="text-xs text-slate-300 italic mt-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    "{app.coverLetter}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <MatchScoreBadge score={app.screening?.overallScore} />
                <StatusBadge status={app.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};