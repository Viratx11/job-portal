import React from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/auth.types';

interface ProtectedRouteProps {
  requiredRole?: UserRole;
  children: React.ReactNode;
  onRedirectToLogin: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole, children, onRedirectToLogin }) => {
  const { user, token } = useAuth();

  if (!token || !user) {
    onRedirectToLogin();
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center bg-slate-900 border border-slate-800 p-8 rounded-2xl">
        <h2 className="text-xl font-bold text-rose-400 mb-2">Access Denied</h2>
        <p className="text-slate-400 text-xs">You do not have the required permissions ({requiredRole}) to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
};