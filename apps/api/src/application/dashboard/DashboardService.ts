import type { DashboardRepository, DrillFaturamento, ItemSerie, ResumoDashboard, SerieDashboard, TipoSerie } from '../../domain/dashboard/Dashboard.js';
import type { MetaRepository } from '../../domain/comercial/Meta.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

const TIPOS: TipoSerie[] = ['dia', 'semana', 'mes', 'ano', 'clientes'];
const lim = (v: any): string | null => (v && /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? String(v) : null);

export class DashboardService {
  constructor(private readonly repo: DashboardRepository, private readonly metas: MetaRepository) {}
  resumo(schema: string): Promise<ResumoDashboard> { return this.repo.resumo(schema); }
  topProdutosCategoria(schema: string, categoriaId: any): Promise<{ nome: string; quantidade: number; valor: number }[]> {
    return this.repo.topProdutosCategoria(schema, categoriaId ? String(categoriaId) : '');
  }
  serie(schema: string, tipo: any, de: any, ate: any): Promise<SerieDashboard> {
    if (!TIPOS.includes(tipo)) throw new ErroAplicacao('dash.serie_tipo_invalido', 400);
    // Intervalo só se aplica ao "dia"; os demais usam janela fixa.
    return this.repo.serie(schema, tipo, tipo === 'dia' ? lim(de) : null, tipo === 'dia' ? lim(ate) : null);
  }
  serieItens(schema: string, tipo: any, de: any, ate: any): Promise<ItemSerie[]> {
    if (!TIPOS.includes(tipo)) throw new ErroAplicacao('dash.serie_tipo_invalido', 400);
    return this.repo.serieItens(schema, tipo, tipo === 'dia' ? lim(de) : null, tipo === 'dia' ? lim(ate) : null);
  }
  async drillFaturamento(schema: string, mes: any): Promise<DrillFaturamento> {
    if (!/^\d{4}-\d{2}$/.test(String(mes))) throw new ErroAplicacao('dash.mes_invalido', 400);
    const drill = await this.repo.drillFaturamento(schema, String(mes));
    // Preenche a meta por dia (do calendário, com fallback) + o total de meta do mês.
    const [ano, m] = String(mes).split('-').map(Number);
    const { porDia, total } = await this.metas.metaDiasMes(schema, ano!, m!);
    drill.metaMes = total;
    drill.dias = drill.dias.map((d) => ({ ...d, meta: porDia[d.dia - 1] ?? 0 }));
    return drill;
  }
}
