import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { JobFeed } from './components/candidate/JobFeed';
import { MyApplicationsPage } from './pages/candidate/MyApplicationsPage';
import { ResumeUploadModal } from './components/candidate/ResumeUploadModal';
import { RecruiterDashboard } from './components/recruiter/RecruiterDashboard';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ShieldCheck } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'applications' | 'resumes' | 'recruiter' | 'login' | 'register'>('feed');

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen w-full bg-[#f4f6f9] dark:bg-[#080c14] text-slate-900 dark:text-slate-100 flex flex-col justify-between antialiased selection:bg-blue-600 selection:text-white transition-colors duration-150">
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="flex-1 w-full flex flex-col">
            {activeTab === 'feed' && <JobFeed onNavigate={setActiveTab} />}
            {activeTab === 'applications' && <MyApplicationsPage />}
            {activeTab === 'resumes' && <ResumeUploadModal />}
            {activeTab === 'recruiter' && <RecruiterDashboard />}
            {activeTab === 'login' && <LoginPage onLoginSuccess={() => setActiveTab('feed')} />}
            {activeTab === 'register' && <RegisterPage onRegisterSuccess={() => setActiveTab('feed')} />}
          </main>
          <footer className="w-full bg-white dark:bg-[#0c111d] border-t border-slate-200 dark:border-slate-800/80 mt-auto transition-colors">
            <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                <span className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center text-[11px] font-extrabold shadow-xs">
                  G
                </span>
                <span>GemHire — Verified Engineering & Product Job Board</span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Prompt-Injection Protected Resume Parser & PDF ATS
                </span>
                <button
                  onClick={() => setActiveTab('feed')}
                  className="hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
                >
                  Browse Jobs
                </button>
                <button
                  onClick={() => setActiveTab('resumes')}
                  className="hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
                >
                  Resumes & PDF Studio
                </button>
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
