import React, { useState } from 'react';
import { signup } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/auth.types';
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
      const response = await signup({ fullName, email, password, phone, role });
      loginSession(response.jwt, response.user);
      onRegisterSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Create an Account</h1>
        <p className="text-slate-400 text-xs mt-1">Join NexusHire as a Job Seeker or Employer</p>
      </div>

      {error && (
        <div className="mb-6 bg-rose-950/50 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Virat Kumar"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="virat@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+919876543210"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Account Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
          >
            <option value="ROLE_JOB_SEEKER">Job Seeker (Candidate)</option>
            <option value="ROLE_EMPLOYER">Employer (Recruiter)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 mt-2 shadow-lg shadow-indigo-600/20"
        >
          {loading ? 'Creating Account...' : 'Register Account'} <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};