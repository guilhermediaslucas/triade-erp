// Cadastro de formas de entrega/envio (modalidades usadas na expedição).
// Separado da lógica de frete do pedido (retirada/motoboy/correios) — é só o catálogo.
export const TIPOS_FORMA_ENTREGA = ['motoboy', 'correios', 'retirada', 'transportadora', 'propria'] as const;
export type TipoFormaEntrega = typeof TIPOS_FORMA_ENTREGA[number];

export interface FormaEntrega {
  id: string; nome: string; tipo: string; prazo: string | null; observacao: string | null; ativo: boolean;
}

export interface FormaEntregaRepository {
  listar(schema: string): Promise<FormaEntrega[]>;
  buscarPorId(schema: string, id: string): Promise<FormaEntrega | null>;
  criar(schema: string, nome: string, tipo: string, prazo: string | null, observacao: string | null): Promise<string>;
  atualizar(schema: string, id: string, nome: string, tipo: string, prazo: string | null, observacao: string | null): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}
