import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext.js';

export function ProtectedRoute({ children, capability }: { children: ReactNode; capability?: string }) {
  const { token, temCapability } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (capability && !temCapability(capability)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
