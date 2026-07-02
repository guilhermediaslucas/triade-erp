import type { ItemNfeRecebida } from './ReceptorFiscal.js';

export type StatusNotaRecebida = 'pendente' | 'importada' | 'ignorada';

// NF-e recebida persistida (controle de pendente/importada + itens p/ a tela de importação).
export interface NotaRecebida {
  id: string;
  chave: string;
  emitenteCnpj: string | null;
  emitenteNome: string | null;
  numero: string | null;
  serie: string | null;
  emissao: string | null;      // ISO date
  valor: number;
  status: StatusNotaRecebida;
  tituloId: string | null;
  itens: ItemNfeRecebida[];
  criadoEm: Date;
}

export type NovaNotaRecebida = Pick<NotaRecebida,
  'chave' | 'emitenteCnpj' | 'emitenteNome' | 'numero' | 'serie' | 'emissao' | 'valor' | 'itens'>;

export interface NotaRecebidaRepository {
  listar(schema: string, filtro: { status?: string | null; de?: string | null; ate?: string | null }): Promise<NotaRecebida[]>;
  buscarPorChave(schema: string, chave: string): Promise<NotaRecebida | null>;
  // Insere se a chave é nova (status 'pendente'); se já existe, atualiza só o resumo/itens (não mexe no status/título).
  upsert(schema: string, n: NovaNotaRecebida): Promise<void>;
  marcarImportada(schema: string, chave: string, tituloId: string | null): Promise<void>;
  // Mapeamento item→produto por fornecedor (lembra a escolha entre notas).
  mapaFornecedor(schema: string, cnpj: string): Promise<Record<string, string>>; // codigo → produtoId
  salvarMapa(schema: string, cnpj: string, codigo: string, produtoId: string): Promise<void>;
}
