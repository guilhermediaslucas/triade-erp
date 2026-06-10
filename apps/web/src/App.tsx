import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider } from './auth/AuthContext.js';
import { BrandingProvider } from './branding/BrandingContext.js';
import { I18nProvider } from './i18n/I18nContext.js';
import { Login } from './pages/Login.js';
import { Dashboard } from './pages/Dashboard.js';
import { Usuarios } from './pages/Usuarios.js';
import { Perfis } from './pages/Perfis.js';
import { DadosEmpresa } from './pages/DadosEmpresa.js';
import { Empresas } from './pages/Empresas.js';
import { Categorias } from './pages/Categorias.js';
import { Produtos } from './pages/Produtos.js';
import { Layout } from './components/Layout.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';

function Protegida({ children, cap }: { children: ReactNode; cap?: string }) {
  return <ProtectedRoute capability={cap}><Layout>{children}</Layout></ProtectedRoute>;
}

export function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrandingProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Protegida><Dashboard /></Protegida>} />
              <Route path="/acesso/usuarios" element={<Protegida cap="acesso.usuario.listar"><Usuarios /></Protegida>} />
              <Route path="/acesso/perfis" element={<Protegida cap="acesso.perfil.listar"><Perfis /></Protegida>} />
              <Route path="/config/empresa" element={<Protegida cap="acesso.empresa.editar"><DadosEmpresa /></Protegida>} />
              <Route path="/cadastros/categorias" element={<Protegida cap="cadastros.categoria.listar"><Categorias /></Protegida>} />
              <Route path="/cadastros/produtos" element={<Protegida cap="cadastros.produto.listar"><Produtos /></Protegida>} />
              <Route path="/superadmin/empresas" element={<Protegida cap="superadmin.empresa.provisionar"><Empresas /></Protegida>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </BrandingProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
