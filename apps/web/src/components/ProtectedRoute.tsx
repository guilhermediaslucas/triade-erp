import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext.js';

export function ProtectedRoute({ children, capability, soSuperAdmin }: { children: ReactNode; capability?: string | string[]; soSuperAdmin?: boolean }) {
  const { token, temCapability, superAdmin } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (soSuperAdmin && !superAdmin) return <Navigate to="/" replace />;
  // any-of: aceita qualquer uma das caps quando vier uma lista.
  const caps = capability == null ? [] : Array.isArray(capability) ? capability : [capability];
  if (caps.length > 0 && !caps.some((c) => temCapability(c))) return <Navigate to="/" replace />;
  return <>{children}</>;
}
