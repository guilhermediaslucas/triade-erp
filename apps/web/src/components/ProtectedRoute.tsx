import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext.js';

export function ProtectedRoute({ children, capability, soSuperAdmin }: { children: ReactNode; capability?: string; soSuperAdmin?: boolean }) {
  const { token, temCapability, superAdmin } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (soSuperAdmin && !superAdmin) return <Navigate to="/" replace />;
  if (capability && !temCapability(capability)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
