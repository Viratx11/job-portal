import React, { useEffect, useState } from 'react';
import {
  applicationApi,
  resumeApi,
  type ApplicationResponse,
  type ResumeResponse,
} from '../../services/api';
import {
  FileText,
  Trash2,
  XCircle,
  MessageSquare,
  ExternalLink,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Building2,
  MapPin,
  Download,
} from 'lucide-react';

export const MyApplicationsPage: React.FC = () => {
  const [apps, setApps] = useState<ApplicationResponse[]>([]);
  const [resumesMap, setResumesMap] = useState<Record<number, ResumeResponse>>({});
  const [expandedAppId, setExpandedAppId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await applicationApi.getMyApplications();
      setApps(data);
      if (data.length > 0 && expandedAppId === null) {
        setExpandedAppId(data[0].id);
      }

      const uniqueResumeIds = Array.from(new Set(data.map((a) => a.resumeId).filter(Boolean)));
      const rMap: Record<number, ResumeResponse> = {};
      await Promise.all(
        uniqueResumeIds.map(async (rId) => {
          try {
            const res = await resumeApi.getResume(rId);
            rMap[rId] = res;
          } catch {
            // ignore
          }
        })
      );
      setResumesMap(rMap);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'SHORTLISTED':
      case 'INTERVIEW_SCHEDULED':
      case 'HIRED':
        return 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300';
      case 'REJECTED':
      case 'WITHDRAWN':
        return 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300';
      case 'REVIEWED':
        return 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300';
      default:
        return 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300';
    }
  };

  return (
    <div className="w-full px-2.5 sm:px-6 lg:px-10 xl:px-14 py-4 sm:py-8 space-y-4 sm:space-y-6 flex-1 min-w-0 overflow-x-hidden">
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 transition-colors">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Application Tracker
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            My Submitted Applications
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Inspect the exact resume, cover note, and salary expectations you submitted, alongside direct evaluation notes from hiring teams.
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
          Total Submissions: <span className="text-blue-600 dark:text-blue-400 text-sm ml-1">{apps.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl py-16 text-center text-slate-400 dark:text-slate-500 text-sm font-medium">
          Loading your applications...
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-2 shadow-2xs">
          <p className="text-slate-800 dark:text-slate-200 font-bold text-base">You haven't applied to any roles yet.</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Browse the Jobs Directory to check your resume fit and apply.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => {
            const usedResume = resumesMap[app.resumeId];
            const isExpanded = expandedAppId === app.id;
            const recruiterNotes = app.notes || [];
            const statusHistory = app.statusHistory || [];
            const resumeSkills =
              usedResume?.skills
                ?.map((s: any) => (typeof s === 'string' ? s : s.skillName || s.name))
                .filter(Boolean) || [];

            return (
              <div
                key={app.id}
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs transition-colors"
              >
                {/* Summary Header */}
                <div
                  onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition w-full min-w-0"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                      <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white break-words">
                        {app.job?.title || `Position #${app.job?.id || app.id}`}
                      </h3>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                      {app.screening?.overallScore !== undefined && (
                        <span className="text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                          Screening Score: {app.screening.overallScore}%
                        </span>
                      )}
                      {recruiterNotes.length > 0 && (
                        <span className="text-xs font-bold bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> {recruiterNotes.length} Note
                          {recruiterNotes.length > 1 ? 's' : ''} from Recruiter
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                      {app.company?.name && (
                        <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                          <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> {app.company.name}
                        </span>
                      )}
                      {app.job?.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {app.job.city}, {app.job.country} (
                          {app.job.workMode})
                        </span>
                      )}
                      <span className="truncate max-w-full">
                        Submitted Resume:{' '}
                        <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                          {usedResume ? `${usedResume.title} (#${app.resumeId})` : `Resume #${app.resumeId}`}
                        </strong>
                      </span>
                      {app.appliedAt && (
                        <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                          <Clock className="w-3.5 h-3.5" /> Applied {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0 self-start sm:self-center" onClick={(e) => e.stopPropagation()}>
                    {app.status !== 'WITHDRAWN' && app.status !== 'HIRED' && (
                      <button
                        onClick={() =>
                          applicationApi.withdraw(app.id, 'Candidate withdrew via portal').then(load)
                        }
                        className="text-[11px] sm:text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition"
                      >
                        <XCircle className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> Withdraw
                      </button>
                    )}
                    <button
                      onClick={() => applicationApi.deleteApplication(app.id).then(load)}
                      className="text-[11px] sm:text-xs font-semibold bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition"
                    >
                      <Trash2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> Delete
                    </button>
                    <button
                      onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                      className="text-[11px] sm:text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-1.5 sm:p-2 rounded-lg cursor-pointer transition"
                      title="Toggle Details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0c111d] p-3 sm:p-5 lg:p-6 min-w-0 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 min-w-0">
                      {/* Left: Submitted Form Inputs & Resume */}
                      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 space-y-4 shadow-2xs min-w-0 overflow-hidden">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Your Submitted Application Form
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-3 rounded-lg min-w-0">
                            <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">
                              Expected Compensation
                            </span>
                            <span className="text-slate-900 dark:text-slate-100 font-bold text-sm mt-0.5 block truncate">
                              {app.expectedSalary ? `₹${app.expectedSalary.toLocaleString()}` : 'Not specified'}
                            </span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-3 rounded-lg min-w-0">
                            <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">
                              Available Start Date
                            </span>
                            <span className="text-slate-900 dark:text-slate-100 font-bold text-sm mt-0.5 block truncate">
                              {app.availableFrom || 'Immediate'}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-3.5 rounded-lg space-y-2 text-xs min-w-0 overflow-hidden">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100 break-words">
                              Resume Attached: {usedResume?.title || `Resume #${app.resumeId}`}
                            </span>
                            <div className="flex items-center gap-2">
                              <a
                                href={`/api/resumes/${app.resumeId}/file`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> Open PDF
                              </a>
                              <a
                                href={`/api/resumes/${app.resumeId}/file?download=true`}
                                className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" /> Download PDF
                              </a>
                            </div>
                          </div>
                          {resumeSkills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
                              {resumeSkills.map((sk: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md shadow-2xs"
                                >
                                  {sk}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5 min-w-0">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                            Submitted Cover Letter / Pitch:
                          </span>
                          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg p-3.5 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed break-words">
                            {app.coverLetter || 'No cover letter was attached to this submission.'}
                          </div>
                        </div>
                      </div>

                      {/* Right: Recruiter Notes & Status History */}
                      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 space-y-4 shadow-2xs min-w-0 overflow-hidden">
                        <div className="space-y-2.5 min-w-0">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Recruiter Notes & Feedback (
                            {recruiterNotes.length})
                          </h4>

                          {recruiterNotes.length === 0 ? (
                            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg p-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                              No direct notes from the hiring manager yet. Whenever the recruiter adds evaluation notes or interview instructions, they appear here automatically.
                            </div>
                          ) : (
                            <div className="space-y-2 min-w-0">
                              {recruiterNotes.map((note) => (
                                <div
                                  key={note.id}
                                  className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-lg p-3.5 space-y-1 min-w-0 overflow-hidden"
                                >
                                  <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed break-words">
                                    {note.content}
                                  </p>
                                  <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-400 block">
                                    Hiring Team Note • {new Date(note.createdAt).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Status History Timeline */}
                        {statusHistory.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 min-w-0 overflow-hidden">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                              Application Status Timeline
                            </span>
                            <div className="space-y-2 min-w-0">
                              {statusHistory.map((h) => (
                                <div
                                  key={h.id}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 px-3 py-2 sm:py-2.5 rounded-lg w-full min-w-0 overflow-hidden"
                                >
                                  <div className="flex items-start sm:items-center gap-2 text-slate-800 dark:text-slate-200 min-w-0 flex-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                                    <div className="flex flex-wrap items-baseline gap-1.5 min-w-0 break-words leading-snug">
                                      <span className="font-bold text-slate-900 dark:text-white shrink-0">
                                        {h.toStatus}
                                      </span>
                                      {h.note && (
                                        <span className="text-slate-600 dark:text-slate-400 break-words min-w-0 font-normal">
                                          — {h.note}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0 self-end sm:self-auto pl-5 sm:pl-0">
                                    {new Date(h.changedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
