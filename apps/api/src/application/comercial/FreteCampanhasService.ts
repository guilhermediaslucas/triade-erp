import type { FreteCampanha, FreteCampanhaRepository, TipoFreteCampanha } from '../../domain/comercial/FreteCampanha.js';
import { TIPOS_FRETE_CAMPANHA } from '../../domain/comercial/FreteCampanha.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

export class FreteCampanhasService {
  constructor(private readonly repo: FreteCampanhaRepository) {}

  listar(schema: string): Promise<FreteCampanha[]> { return this.repo.listar(schema); }

  async criar(schema: string, e: any): Promise<void> {
    // clienteId vazio = campanha GERAL (vale para todos).
    const clienteId = String(e?.clienteId ?? '').trim() || null;
    const tipo = String(e?.tipo ?? '').trim() as TipoFreteCampanha;
    if (!TIPOS_FRETE_CAMPANHA.includes(tipo)) throw new ErroAplicacao('frete.campanha_tipo_invalido', 400);
    let valor = Number(e?.valor ?? 0);
    if (!Number.isFinite(valor) || valor < 0) throw new ErroAplicacao('frete.campanha_valor_invalido', 400);
    if (tipo === 'gratis') valor = 0;
    if (tipo === 'percentual' && valor > 100) throw new ErroAplicacao('frete.campanha_valor_invalido', 400);
    if (tipo === 'gratis_acima' && valor <= 0) throw new ErroAplicacao('frete.campanha_valor_invalido', 400);
    const de = String(e?.de ?? ''); const ate = String(e?.ate ?? '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(de) || !/^\d{4}-\d{2}-\d{2}$/.test(ate)) throw new ErroAplicacao('financeiro.vencimento_invalido', 400);
    if (ate < de) throw new ErroAplicacao('campanha.periodo_invalido', 400);
    await this.repo.criar(schema, { clienteId, tipo, valor, motivo: (e?.motivo && String(e.motivo).trim()) || null, de, ate });
  }

  remover(schema: string, id: string): Promise<void> { return this.repo.remover(schema, id); }

  // Frete cobrado do cliente aplicando a campanha vigente (usado no Novo pedido p/ exibir o total certo).
  // subtotal = valor do pedido (produtos), usado pelas campanhas 'gratis_acima'.
  cobrado(schema: string, clienteId: string, custo: number, subtotal: number): Promise<number> {
    const c = Number.isFinite(custo) && custo > 0 ? custo : 0;
    const sub = Number.isFinite(subtotal) && subtotal > 0 ? subtotal : 0;
    if (!clienteId) return Promise.resolve(c);
    return this.repo.freteCobrado(schema, clienteId, c, sub);
  }
}
