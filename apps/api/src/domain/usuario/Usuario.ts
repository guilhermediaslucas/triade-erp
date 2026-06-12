export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  ativo: boolean;
  perfilId: string | null;
  foto: string | null;   // data URI da foto/avatar (opcional)
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
}
