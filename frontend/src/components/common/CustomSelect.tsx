import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  badge?: string;
}

interface CustomSelectProps {
  value: string | number;
  onChange: (val: any) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  disabled = false,
  icon,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => String(o.value) === String(value));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={`relative inline-block w-full text-left ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium hover:border-slate-400 dark:hover:border-slate-600 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          {icon}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 transition-transform duration-150 ${
            open ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
          }`}
        />
      </button>

      {open && (
        <div
          className={`absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-lg shadow-xl py-1 max-h-60 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/80 ${menuClassName}`}
        >
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="truncate">{opt.label}</span>
                  {opt.badge && (
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono shrink-0">
                      {opt.badge}
                    </span>
                  )}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
