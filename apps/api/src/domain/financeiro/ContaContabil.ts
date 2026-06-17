// Plano de contas (conta contábil). A categoria financeira aponta para uma conta
// daqui, para a escrituração / DRE com a conta contábil.
export type TipoContaContabil = 'receita' | 'despesa' | 'ativo' | 'passivo';
export const TIPOS_CONTA_CONTABIL: TipoContaContabil[] = ['receita', 'despesa', 'ativo', 'passivo'];

export interface ContaContabil {
  id: string;
  codigo: string;
  descricao: string;
  tipo: TipoContaContabil;
  paiId: string | null;
  ativo: boolean;
}

export interface NovaContaContabil {
  codigo: string;
  descricao: string;
  tipo: TipoContaContabil;
  paiId: string | null;
}

export interface ContaContabilRepository {
  listar(schema: string): Promise<ContaContabil[]>;
  buscarPorId(schema: string, id: string): Promise<ContaContabil | null>;
  criar(schema: string, d: NovaContaContabil): Promise<string>;
  atualizar(schema: string, id: string, d: NovaContaContabil): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}
