// Entidade de dominio pura (sem ORM).
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  ativo: boolean;
  criadoEm: Date; // UTC
}
