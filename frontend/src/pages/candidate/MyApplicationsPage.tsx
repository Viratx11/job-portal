import React, { useEffect, useState } from 'react';
import { applicationApi, type ApplicationResponse } from '../../services/api';
import { FileText, Trash2, XCircle } from 'lucide-react';

export const MyApplicationsPage: React.FC = () => {
  const [apps, setApps] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await applicationApi.getMyApplications();
      setApps(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100">My Job Applications</h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Track your submission status and asynchronous AI screening scores
        </p>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading applications...</p>
      ) : apps.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-2">
          <p className="text-slate-300 font-medium">You haven't applied to any roles yet.</p>
          <p className="text-slate-500 text-xs">Explore the Job Feed and apply using AI match.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <div
              key={app.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-100">
                    {app.job?.title || `Job #${app.job?.id || app.id}`}
                  </h3>
                  <span className="text-xs bg-indigo-950 border border-indigo-800 text-indigo-300 px-2.5 py-0.5 rounded-full">
                    {app.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Resume #{app.resumeId} • Expected Salary: {app.expectedSalary || 'N/A'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {app.status !== 'WITHDRAWN' && (
                  <button
                    onClick={() => applicationApi.withdraw(app.id, 'Candidate withdrew via portal').then(load)}
                    className="text-xs bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Withdraw
                  </button>
                )}
                <button
                  onClick={() => applicationApi.deleteApplication(app.id).then(load)}
                  className="text-xs bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};