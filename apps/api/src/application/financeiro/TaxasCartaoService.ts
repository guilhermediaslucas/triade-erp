import type { FormaPagamentoTaxa, FormaPagamentoTaxaRepository } from '../../domain/financeiro/FormaPagamentoTaxa.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

function validarForma(forma: string): string {
  if (!forma || forma.trim().length < 2) throw new ErroAplicacao('cadastro.nome_invalido', 400);
  return forma.trim();
}
function validarPercentual(p: any): number {
  const n = Number(p);
  if (!Number.isFinite(n) || n < 0 || n > 100) throw new ErroAplicacao('taxacartao.percentual_invalido', 400);
  return Math.round(n * 1000) / 1000;
}

export class TaxasCartaoService {
  constructor(private readonly repo: FormaPagamentoTaxaRepository) {}
  listar(schema: string): Promise<FormaPagamentoTaxa[]> { return this.repo.listar(schema); }
  criar(schema: string, e: any): Promise<string> { return this.repo.criar(schema, validarForma(e?.forma), validarPercentual(e?.percentual)); }
  async editar(schema: string, id: string, e: any): Promise<void> {
    const forma = validarForma(e?.forma); const pct = validarPercentual(e?.percentual);
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.atualizar(schema, id, forma, pct);
  }
  async alternarAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.definirAtivo(schema, id, ativo);
  }
}
