// Chamado de suporte aberto por um usuário de qualquer tenant. Vive no schema
// public porque o administrador do sistema (super-admin) vê os chamados de
// todas as empresas numa tela só.
export const TIPOS_CHAMADO = ['erro', 'sugestao', 'duvida'] as const;
export type TipoChamado = (typeof TIPOS_CHAMADO)[number];

export const STATUS_CHAMADO = ['aberto', 'em_andamento', 'resolvido'] as const;
export type StatusChamado = (typeof STATUS_CHAMADO)[number];

export interface Chamado {
  id: string;
  tipo: TipoChamado;
  assunto: string;
  descricao: string;
  print: string | null;
  tela: string;
  versao: string;
  empresaCodigo: string;
  empresaFantasia: string;
  usuarioNome: string;
  usuarioEmail: string;
  status: StatusChamado;
  criadoEm: Date;
  resolvidoEm: Date | null;
}

// Dados informados por quem abre o chamado (o resto — empresa/usuário — vem do token).
export interface NovoChamado {
  tipo: TipoChamado;
  assunto: string;
  descricao: string;
  print: string | null;
  tela: string;
  versao: string;
  empresaCodigo: string;
  usuarioNome: string;
  usuarioEmail: string;
}

export interface ChamadoRepository {
  listar(): Promise<Chamado[]>;
  listarPorUsuario(email: string, empresaCodigo: string): Promise<Chamado[]>;
  buscarPorId(id: string): Promise<Chamado | null>;
  contarAbertos(): Promise<number>;
  criar(c: NovoChamado): Promise<string>;
  definirStatus(id: string, status: StatusChamado, resolvidoEm: Date | null): Promise<void>;
}
