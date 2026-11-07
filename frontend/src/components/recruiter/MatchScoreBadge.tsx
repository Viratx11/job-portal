import React from 'react';

export const MatchScoreBadge: React.FC<{ score?: number }> = ({ score }) => {
  if (score === undefined || score === null) {
    return (
      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-full">
        Unscreened
      </span>
    );
  }

  const color =
    score >= 75
      ? 'text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-850 bg-emerald-50 dark:bg-emerald-950/40'
      : score >= 50
        ? 'text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-850 bg-amber-50 dark:bg-amber-950/40'
        : 'text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-850 bg-rose-50 dark:bg-rose-950/40';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-bold ${color}`}>
      {score}% Match
    </span>
  );
};
