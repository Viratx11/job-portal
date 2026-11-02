import React from 'react';
import { Sparkles } from 'lucide-react';

export const MatchScoreBadge: React.FC<{ score?: number }> = ({ score }) => {
  if (score === undefined || score === null) {
    <span className="text-xs text-slate-500 italic">Pending AI Scan...</span>;
  }

  const color = (score ?? 0) >= 80 ? 'text-emerald-400 border-emerald-800/50 bg-emerald-950/30' : 'text-amber-400 border-amber-800/50 bg-amber-950/30';

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold ${color}`}>
      <Sparkles className="w-3.5 h-3.5" />
      <span>{score}% Match</span>
    </div>
  );
};