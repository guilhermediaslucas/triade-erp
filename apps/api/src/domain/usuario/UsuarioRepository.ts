import type { Usuario, UsuarioResumo } from './Usuario.js';

export interface NovoUsuario {
  nome: string;
  email: string;
  senhaHash: string;
  perfilId: string | null;
  foto?: string | null;
}

export interface UsuarioRepository {
  buscarPorEmail(schema: string, email: string): Promise<Usuario | null>;
  buscarPrimeiro(schema: string): Promise<Usuario | null>;   // admin inicial = usuário mais antigo
  atualizarNomeEmail(schema: string, id: string, nome: string, email: string): Promise<void>;
  listar(schema: string): Promise<UsuarioResumo[]>;
  buscarPorId(schema: string, id: string): Promise<Usuario | null>;
  emailExiste(schema: string, email: string, excetoId?: string): Promise<boolean>;
  criar(schema: string, dados: NovoUsuario): Promise<string>;
  atualizar(schema: string, id: string, nome: string, perfilId: string | null, foto: string | null): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
  definirSenha(schema: string, id: string, senhaHash: string): Promise<void>;
  capabilities(schema: string, usuarioId: string): Promise<string[]>;
}
