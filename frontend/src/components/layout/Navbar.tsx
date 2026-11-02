import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  FileText,
  Building2,
  LogOut,
  Sparkles,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isEmployer = user?.role === 'ROLE_EMPLOYER';

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Navbar Header */}
      <nav className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3.5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          {/* Logo */}
          <div
            onClick={() => handleNavClick('feed')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/30">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-indigo-400">NexusHire</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => handleNavClick('feed')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'feed' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Search className="w-3.5 h-3.5" /> Job Feed
            </button>

            {user && !isEmployer && (
              <>
                <button
                  onClick={() => handleNavClick('applications')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                    activeTab === 'applications' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> My Applications
                </button>

                <button
                  onClick={() => handleNavClick('resumes')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                    activeTab === 'resumes' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Resume & AI Studio
                </button>
              </>
            )}

            {user && isEmployer && (
              <button
                onClick={() => handleNavClick('recruiter')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                  activeTab === 'recruiter' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> Employer Hub
              </button>
            )}
          </div>

          {/* Desktop User Info & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-950 p-1.5 rounded-lg text-indigo-400">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-200 leading-tight">{user.fullName}</p>
                    <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider">{user.role.replace('ROLE_', '')}</p>
                  </div>
                </div>
                <div className="h-4 w-px bg-slate-800 mx-1" />
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="text-xs text-slate-300 hover:text-white px-3.5 py-2 rounded-xl font-medium cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-300 hover:text-white p-2 rounded-xl bg-slate-800/50 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Slide-out Sidebar & Footer Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          {/* Sidebar Drawer Content */}
          <div className="relative w-72 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-600 p-2 rounded-xl text-white">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className="text-base font-bold text-indigo-400">NexusHire Menu</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-slate-200 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-2">
                <button
                  onClick={() => handleNavClick('feed')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'feed' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Search className="w-4 h-4" /> Job Feed
                </button>

                {user && !isEmployer && (
                  <>
                    <button
                      onClick={() => handleNavClick('applications')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${
                        activeTab === 'applications' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <FileText className="w-4 h-4" /> My Applications
                    </button>

                    <button
                      onClick={() => handleNavClick('resumes')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${
                        activeTab === 'resumes' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" /> Resume & AI Studio
                    </button>
                  </>
                )}

                {user && isEmployer && (
                  <button
                    onClick={() => handleNavClick('recruiter')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${
                      activeTab === 'recruiter' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Building2 className="w-4 h-4" /> Employer Hub
                  </button>
                )}
              </div>
            </div>

            {/* Permanent Sidebar Footer (Username & Logout or Sign In) */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              {user ? (
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-indigo-950 p-2 rounded-lg text-indigo-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-100 truncate">{user.fullName}</p>
                      <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider">{user.role.replace('ROLE_', '')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-rose-950/40 hover:bg-rose-950/60 border border-rose-800/80 text-rose-300 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNavClick('login')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNavClick('register')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Register
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