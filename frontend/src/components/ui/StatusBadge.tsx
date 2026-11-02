import React from 'react';
import type { ApplicationStatus } from '../../types/application.types';

export const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
  const styles: Record<ApplicationStatus, string> = {
    PENDING: 'bg-amber-950/50 text-amber-400 border-amber-800/60',
    REVIEWED: 'bg-blue-950/50 text-blue-400 border-blue-800/60',
    SHORTLISTED: 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60',
    INTERVIEW_SCHEDULED: 'bg-indigo-950/50 text-indigo-400 border-indigo-800/60',
    REJECTED: 'bg-rose-950/50 text-rose-400 border-rose-800/60',
    HIRED: 'bg-emerald-900 text-emerald-100 border-emerald-600',
    WITHDRAWN: 'bg-slate-800 text-slate-400 border-slate-700',
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${styles[status] || 'bg-slate-800 text-slate-300'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};