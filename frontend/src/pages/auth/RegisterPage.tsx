import React, { useState } from 'react';
import { authApi, type UserRole } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Phone, ArrowRight, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC<{ onRegisterSuccess: () => void }> = ({ onRegisterSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('ROLE_JOB_SEEKER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginSession } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.signup({ fullName, email, password, phone, role });
      loginSession(response.jwt, response.user);
      onRegisterSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center px-4 py-8 min-w-0">
      <div className="max-w-lg w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors">
        <div className="mb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Get Started
          </span>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Create Your Account
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Choose whether you are looking for engineering roles or hiring talent
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Type Selector Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">I want to:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('ROLE_JOB_SEEKER')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  role === 'ROLE_JOB_SEEKER'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Find Jobs (Candidate)
              </button>
              <button
                type="button"
                onClick={() => setRole('ROLE_EMPLOYER')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  role === 'ROLE_EMPLOYER'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Hire Talent (Employer)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Virat Kumar"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="virat@example.com"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-xs"
          >
            {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
