// Token de redefinição de senha (vive no schema public). Guardamos só o HASH do
// token, nunca o token em si. schema_name/usuario_id nulos = super-admin do sistema.
export interface ResetSenha {
  id: string;
  tokenHash: string;
  email: string;
  schemaName: string | null;
  usuarioId: string | null;
  expiraEm: Date;
  usadoEm: Date | null;
}

export interface NovoResetSenha {
  tokenHash: string;
  email: string;
  schemaName: string | null;
  usuarioId: string | null;
  expiraEm: Date;
}

export interface ResetSenhaRepository {
  criar(d: NovoResetSenha): Promise<void>;
  buscarPorTokenHash(tokenHash: string): Promise<ResetSenha | null>;
  marcarUsado(id: string): Promise<void>;
}
