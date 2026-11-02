import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { JobFeed } from './components/candidate/JobFeed';
import { MyApplicationsPage } from './pages/candidate/MyApplicationsPage';
import { ResumeUploadModal } from './components/candidate/ResumeUploadModal';
import { RecruiterDashboard } from './components/recruiter/RecruiterDashboard';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

export function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'applications' | 'resumes' | 'recruiter' | 'login' | 'register'>('feed');

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1">
          {activeTab === 'feed' && <JobFeed />}
          {activeTab === 'applications' && <MyApplicationsPage />}
          {activeTab === 'resumes' && <ResumeUploadModal />}
          {activeTab === 'recruiter' && <RecruiterDashboard />}
          {activeTab === 'login' && <LoginPage onLoginSuccess={() => setActiveTab('feed')} />}
          {activeTab === 'register' && <RegisterPage onRegisterSuccess={() => setActiveTab('feed')} />}
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;