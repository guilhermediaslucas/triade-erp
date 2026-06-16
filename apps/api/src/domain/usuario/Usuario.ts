export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  ativo: boolean;
  perfilId: string | null;
  foto: string | null;   // data URI da foto/avatar (opcional)
  vendedorId: string | null;   // cadastro de Vendedor vinculado a este login (opcional)
  trocarSenha: boolean;  // senha provisória: força a troca no próximo login
  criadoEm: Date; // UTC
}

// Visao sem dados sensiveis (para listagens/respostas).
export interface UsuarioResumo {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  perfilId: string | null;
  perfilNome: string | null;
  foto: string | null;
  vendedorId: string | null;
  vendedorNome: string | null;
  trocarSenha: boolean;
}
