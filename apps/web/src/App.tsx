import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.js';
import { I18nProvider } from './i18n/I18nContext.js';
import { Login } from './pages/Login.js';
import { Dashboard } from './pages/Dashboard.js';
import { Usuarios } from './pages/Usuarios.js';
import { Perfis } from './pages/Perfis.js';
import { Layout } from './components/Layout.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import type { ReactNode } from 'react';

function Protegida({ children, cap }: { children: ReactNode; cap?: string }) {
  return <ProtectedRoute capability={cap}><Layout>{children}</Layout></ProtectedRoute>;
}

export function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Protegida><Dashboard /></Protegida>} />
            <Route path="/acesso/usuarios" element={<Protegida cap="acesso.usuario.listar"><Usuarios /></Protegida>} />
            <Route path="/acesso/perfis" element={<Protegida cap="acesso.perfil.listar"><Perfis /></Protegida>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  );
}
