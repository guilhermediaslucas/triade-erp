import type { DashboardRepository, DrillFaturamento, ItemSerie, ResumoDashboard, SerieDashboard, TipoSerie } from '../../domain/dashboard/Dashboard.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

const TIPOS: TipoSerie[] = ['dia', 'semana', 'mes', 'ano', 'clientes'];
const lim = (v: any): string | null => (v && /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? String(v) : null);

export class DashboardService {
  constructor(private readonly repo: DashboardRepository) {}
  resumo(schema: string): Promise<ResumoDashboard> { return this.repo.resumo(schema); }
  serie(schema: string, tipo: any, de: any, ate: any): Promise<SerieDashboard> {
    if (!TIPOS.includes(tipo)) throw new ErroAplicacao('dash.serie_tipo_invalido', 400);
    // Intervalo só se aplica ao "dia"; os demais usam janela fixa.
    return this.repo.serie(schema, tipo, tipo === 'dia' ? lim(de) : null, tipo === 'dia' ? lim(ate) : null);
  }
  serieItens(schema: string, tipo: any, de: any, ate: any): Promise<ItemSerie[]> {
    if (!TIPOS.includes(tipo)) throw new ErroAplicacao('dash.serie_tipo_invalido', 400);
    return this.repo.serieItens(schema, tipo, tipo === 'dia' ? lim(de) : null, tipo === 'dia' ? lim(ate) : null);
  }
  drillFaturamento(schema: string, mes: any): Promise<DrillFaturamento> {
    if (!/^\d{4}-\d{2}$/.test(String(mes))) throw new ErroAplicacao('dash.mes_invalido', 400);
    return this.repo.drillFaturamento(schema, String(mes));
  }
}
