// Administrador global do sistema (vive no schema public, fora dos tenants).
export interface SuperAdmin {
  id: string;
  email: string;
  nome: string;
  senhaHash: string;
}

export interface SuperAdminRepository {
  buscarPorEmail(email: string): Promise<SuperAdmin | null>;
}
