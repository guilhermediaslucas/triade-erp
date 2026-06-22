import type { DadosDescontoPedido, DescontoPedido, DescontoPedidoRepository, TipoDescontoPedido } from '../../domain/comercial/DescontoPedido.js';
import { TIPOS_DESCONTO_PEDIDO } from '../../domain/comercial/DescontoPedido.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

export class DescontosPedidoService {
  constructor(private readonly repo: DescontoPedidoRepository) {}

  listar(schema: string): Promise<DescontoPedido[]> { return this.repo.listar(schema); }

  // Resolve o desconto vigente para um cliente + subtotal (usado no Novo pedido p/ exibir o total certo).
  resolver(schema: string, clienteId: string, subtotal: number): Promise<number> {
    const cid = String(clienteId ?? '').trim();
    const sub = Number.isFinite(subtotal) && subtotal > 0 ? subtotal : 0;
    if (!cid || sub <= 0) return Promise.resolve(0);
    return this.repo.descontoVigente(schema, cid, sub);
  }

  private validar(e: any): DadosDescontoPedido {
    const clienteId = String(e?.clienteId ?? '').trim() || null;
    const tipo = String(e?.tipo ?? '').trim() as TipoDescontoPedido;
    if (!TIPOS_DESCONTO_PEDIDO.includes(tipo)) throw new ErroAplicacao('frete.campanha_tipo_invalido', 400);
    const valor = Number(e?.valor ?? 0);
    if (!Number.isFinite(valor) || valor < 0) throw new ErroAplicacao('frete.campanha_valor_invalido', 400);
    if (tipo === 'percentual' && valor > 100) throw new ErroAplicacao('frete.campanha_valor_invalido', 400);
    const minimo = Number(e?.minimo ?? 0);
    if (!Number.isFinite(minimo) || minimo < 0) throw new ErroAplicacao('frete.campanha_valor_invalido', 400);
    const de = String(e?.de ?? ''); const ate = String(e?.ate ?? '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(de) || !/^\d{4}-\d{2}-\d{2}$/.test(ate)) throw new ErroAplicacao('financeiro.vencimento_invalido', 400);
    if (ate < de) throw new ErroAplicacao('campanha.periodo_invalido', 400);
    return { clienteId, tipo, valor, minimo, motivo: (e?.motivo && String(e.motivo).trim()) || null, de, ate };
  }

  criar(schema: string, e: any): Promise<void> { return this.repo.criar(schema, this.validar(e)); }
  editar(schema: string, id: string, e: any): Promise<void> { return this.repo.atualizar(schema, id, this.validar(e)); }
  remover(schema: string, id: string): Promise<void> { return this.repo.remover(schema, id); }
}
