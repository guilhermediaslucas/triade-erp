export interface LinhaComissao { vendedorId: string; vendedor: string; percentual: number; vendido: number; comissao: number; }

// Regra de comissão: % por pedido, opcionalmente por vendedor e por período (ou indeterminada).
// Prioridade de aplicação por pedido: 1) regra do vendedor vigente; 2) regra geral vigente;
// 3) fallback no % individual do vendedor (compat).
export interface ComissaoRegra {
  id: string; nome: string; taxa: number;
  vendedorId: string | null; vendedorNome: string | null;
  de: string | null; ate: string | null; ativo: boolean;
}
export interface NovaComissaoRegra {
  nome: string; taxa: number; vendedorId: string | null; de: string | null; ate: string | null;
}

export interface ComissaoRepository {
  apurar(schema: string, de: string | null, ate: string | null): Promise<LinhaComissao[]>;
  listarRegras(schema: string): Promise<ComissaoRegra[]>;
  buscarRegra(schema: string, id: string): Promise<ComissaoRegra | null>;
  criarRegra(schema: string, r: NovaComissaoRegra): Promise<string>;
  atualizarRegra(schema: string, id: string, r: NovaComissaoRegra): Promise<void>;
  definirAtivoRegra(schema: string, id: string, ativo: boolean): Promise<void>;
}
