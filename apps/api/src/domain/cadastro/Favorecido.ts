export type TipoFavorecido = 'PF' | 'PJ';
export const TIPOS_FAVORECIDO: TipoFavorecido[] = ['PF', 'PJ'];

export interface Favorecido {
  id: string;
  nome: string;
  tipoPessoa: TipoFavorecido;
  documento: string | null;
  chavePix: string | null;
  banco: string | null;
  agencia: string | null;
  conta: string | null;
  observacao: string | null;
  ativo: boolean;
}

export interface NovoFavorecido {
  nome: string;
  tipoPessoa: TipoFavorecido;
  documento: string | null;
  chavePix: string | null;
  banco: string | null;
  agencia: string | null;
  conta: string | null;
  observacao: string | null;
}

export interface FavorecidoRepository {
  listar(schema: string): Promise<Favorecido[]>;
  buscarPorId(schema: string, id: string): Promise<Favorecido | null>;
  criar(schema: string, dados: NovoFavorecido): Promise<string>;
  atualizar(schema: string, id: string, dados: NovoFavorecido): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}
