import type { LinhaProduto, RelatorioRepository, RelatorioVendas } from '../../domain/relatorio/Relatorio.js';
const lim = (v: any): string | null => (v && /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? String(v) : null);
export class RelatoriosService {
  constructor(private readonly repo: RelatorioRepository) {}
  vendas(schema: string, de: any, ate: any): Promise<RelatorioVendas> { return this.repo.vendas(schema, lim(de), lim(ate)); }
  produtosVendidos(schema: string, de: any, ate: any): Promise<LinhaProduto[]> { return this.repo.produtosVendidos(schema, lim(de), lim(ate)); }
}
