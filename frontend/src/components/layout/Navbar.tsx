import React, { useState } from 'react';
import {
  Briefcase,
  FileText,
  Building2,
  LogOut,
  Menu,
  X,
  FolderKanban,
  PlusCircle,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isEmployer = user?.role === 'ROLE_EMPLOYER';

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white dark:bg-[#0c111d] border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-50 shadow-2xs w-full transition-colors">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 h-16 flex justify-between items-center gap-4">
          {/* Left: Brand & Navigation */}
          <div className="flex items-center gap-6 lg:gap-8">
            <div
              onClick={() => handleNavClick('feed')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-base shadow-xs group-hover:bg-blue-700 transition">
                G
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                  GemHire
                </span>
                <span className="hidden xl:inline-block text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-850 px-2 py-0.5 rounded-full">
                  Verified Tech Jobs
                </span>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1.5">
              <button
                onClick={() => handleNavClick('feed')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                  activeTab === 'feed'
                    ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <Briefcase className="w-4 h-4" /> Browse Jobs
              </button>

              {user && !isEmployer && (
                <>
                  <button
                    onClick={() => handleNavClick('applications')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                      activeTab === 'applications'
                        ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <FolderKanban className="w-4 h-4" /> My Applications
                  </button>

                  <button
                    onClick={() => handleNavClick('resumes')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                      activeTab === 'resumes'
                        ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <FileText className="w-4 h-4" /> Resumes & CV
                  </button>
                </>
              )}

              {user && isEmployer && (
                <button
                  onClick={() => handleNavClick('recruiter')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    activeTab === 'recruiter'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <Building2 className="w-4 h-4" /> Employer Dashboard & ATS
                </button>
              )}
            </nav>
          </div>

          {/* Right: Theme Toggle & Auth / Account Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Desktop Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition cursor-pointer text-xs font-semibold"
              title={`Theme: ${theme.toUpperCase()} (${resolvedTheme === 'dark' ? 'Dark' : 'Light'}) • Click to toggle System/Dark/Light`}
            >
              {theme === 'system' ? (
                <>
                  <Monitor className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="capitalize">Auto</span>
                </>
              ) : theme === 'dark' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="capitalize">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="capitalize">Light</span>
                </>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {isEmployer && activeTab !== 'recruiter' && (
                  <button
                    onClick={() => handleNavClick('recruiter')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Post a Job
                  </button>
                )}

                <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{user.fullName}</p>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                      {isEmployer ? 'Recruiter / Company' : 'Candidate'}
                    </p>
                  </div>
                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
                  <button
                    onClick={() => {
                      logout();
                      setActiveTab('feed');
                    }}
                    className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-rose-400 p-1 rounded transition cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleNavClick('login')}
                  className="text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3.5 py-2 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-xs transition cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right: Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'system' ? (
                <Monitor className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              ) : theme === 'dark' ? (
                <Moon className="w-4 h-4 text-amber-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs"
          />
          <div className="relative w-72 bg-white dark:bg-[#0c111d] border-r border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between z-10 shadow-xl transition-colors">
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-display text-base font-extrabold text-slate-900 dark:text-white">GemHire</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-500 dark:text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Theme Selector in Mobile Drawer */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Theme Appearance
                </span>
                <div className="grid grid-cols-3 gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setTheme('light')}
                    className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                      theme === 'light'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" /> Light
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" /> Dark
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                      theme === 'system'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> Auto
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <button
                  onClick={() => handleNavClick('feed')}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${
                    activeTab === 'feed'
                      ? 'bg-slate-900 dark:bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Briefcase className="w-4 h-4" /> Browse Jobs
                </button>
                {user && !isEmployer && (
                  <>
                    <button
                      onClick={() => handleNavClick('applications')}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${
                        activeTab === 'applications'
                          ? 'bg-slate-900 dark:bg-blue-600 text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <FolderKanban className="w-4 h-4" /> My Applications
                    </button>
                    <button
                      onClick={() => handleNavClick('resumes')}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${
                        activeTab === 'resumes'
                          ? 'bg-slate-900 dark:bg-blue-600 text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <FileText className="w-4 h-4" /> Resumes & CV
                    </button>
                  </>
                )}
                {user && isEmployer && (
                  <button
                    onClick={() => handleNavClick('recruiter')}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${
                      activeTab === 'recruiter'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Building2 className="w-4 h-4" /> Employer Dashboard & ATS
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
              {user ? (
                <div className="space-y-2.5">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user.fullName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{isEmployer ? 'Recruiter Account' : 'Candidate Account'}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setActiveTab('feed');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-red-50 dark:bg-rose-950/30 hover:bg-red-100 dark:hover:bg-rose-900/40 border border-red-200 dark:border-rose-800 text-red-700 dark:text-rose-300 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNavClick('login')}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => handleNavClick('register')}
                    className="bg-blue-600 text-white py-2.5 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
