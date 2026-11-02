import React from 'react';
import { FolderSearch } from 'lucide-react';

export const EmptyState: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
    <FolderSearch className="w-10 h-10 text-slate-600 mx-auto mb-3" />
    <h3 className="text-slate-200 font-bold text-base">{title}</h3>
    <p className="text-slate-500 text-xs mt-1">{description}</p>
  </div>
);