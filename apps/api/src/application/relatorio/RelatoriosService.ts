import type { ClasseAbc, LinhaAbc, LinhaEntregaVol, LinhaEstoqueParado, LinhaPerda, LinhaProduto, RelatorioAbc, RelatorioRepository, RelatorioVendas, RelatorioVendasContabil } from '../../domain/relatorio/Relatorio.js';
const lim = (v: any): string | null => (v && /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? String(v) : null);
const r2 = (n: number) => Math.round(n * 100) / 100;

export class RelatoriosService {
  constructor(private readonly repo: RelatorioRepository) {}
  vendas(schema: string, de: any, ate: any): Promise<RelatorioVendas> { return this.repo.vendas(schema, lim(de), lim(ate)); }
  vendasContabil(schema: string, de: any, ate: any): Promise<RelatorioVendasContabil> { return this.repo.vendasContabil(schema, lim(de), lim(ate)); }
  produtosVendidos(schema: string, de: any, ate: any): Promise<LinhaProduto[]> { return this.repo.produtosVendidos(schema, lim(de), lim(ate)); }
  validadeLotes(schema: string) { return this.repo.validadeLotes(schema); }
  estoqueParado(schema: string) { return this.repo.estoqueParado(schema); }
  perdasEstoque(schema: string, de: any, ate: any): Promise<LinhaPerda[]> { return this.repo.perdasEstoque(schema, lim(de), lim(ate)); }
  pedidos(schema: string, de: any, ate: any, status: any) {
    const st = (status && String(status).trim()) || null;
    return this.repo.pedidos(schema, lim(de), lim(ate), st);
  }
  volumeEntregas(schema: string, de: any, ate: any): Promise<LinhaEntregaVol[]> { return this.repo.volumeEntregas(schema, lim(de), lim(ate)); }

  // Curva ABC: ordenados por receita, classe A (≤80% acumulado), B (≤95%), C (resto). por=produtos|clientes.
  async curvaAbc(schema: string, de: any, ate: any, por: any): Promise<RelatorioAbc> {
    const base = por === 'clientes'
      ? await this.repo.curvaAbcClientes(schema, lim(de), lim(ate))
      : await this.repo.curvaAbcProdutos(schema, lim(de), lim(ate));
    const totalGeral = r2(base.reduce((a, l) => a + l.total, 0));
    const resumo: Record<ClasseAbc, { itens: number; total: number }> = {
      A: { itens: 0, total: 0 }, B: { itens: 0, total: 0 }, C: { itens: 0, total: 0 },
    };
    let acumulado = 0;
    const linhas: LinhaAbc[] = base.map((l) => {
      const pct = totalGeral > 0 ? r2((l.total / totalGeral) * 100) : 0;
      acumulado += l.total;
      const acumuladoPct = totalGeral > 0 ? r2((acumulado / totalGeral) * 100) : 0;
      const classe: ClasseAbc = acumuladoPct <= 80 ? 'A' : acumuladoPct <= 95 ? 'B' : 'C';
      resumo[classe].itens += 1;
      resumo[classe].total = r2(resumo[classe].total + l.total);
      return { nome: l.nome, quantidade: l.quantidade, total: l.total, pct, acumuladoPct, classe };
    });
    return { linhas, totalGeral, resumo };
  }
}
