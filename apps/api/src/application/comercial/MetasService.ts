import type { MetaDia, MetaMes, MetaRepository } from '../../domain/comercial/Meta.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

function anoValido(a: any): number {
  const n = Math.trunc(Number(a));
  if (!Number.isFinite(n) || n < 2000 || n > 2100) throw new ErroAplicacao('meta.ano_invalido', 400);
  return n;
}
function naoNeg(v: any): number {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) throw new ErroAplicacao('meta.valor_invalido', 400);
  return n;
}

export class MetasService {
  constructor(private readonly repo: MetaRepository) {}

  obter(schema: string, ano: any): Promise<MetaMes[]> {
    return this.repo.listarAno(schema, anoValido(ano));
  }

  // Ajuste fino por dia (calendário) do ano.
  obterDias(schema: string, ano: any): Promise<MetaDia[]> {
    return this.repo.listarDiasAno(schema, anoValido(ano));
  }

  async salvar(schema: string, e: any): Promise<void> {
    const ano = anoValido(e?.ano);
    const lista: any[] = Array.isArray(e?.meses) ? e.meses : [];
    const meses: MetaMes[] = lista.map((m) => {
      const mes = Math.trunc(Number(m?.mes));
      if (!Number.isFinite(mes) || mes < 1 || mes > 12) throw new ErroAplicacao('meta.mes_invalido', 400);
      return { mes, valor: naoNeg(m?.valor ?? 0), metaDiaUtil: naoNeg(m?.metaDiaUtil ?? 0), metaSabado: naoNeg(m?.metaSabado ?? 0) };
    });
    await this.repo.salvarAno(schema, ano, meses);

    // Calendário (opcional): substitui o conjunto de dias do ano. Feriado => valor 0.
    if (Array.isArray(e?.dias)) {
      const dias: MetaDia[] = e.dias.map((d: any) => {
        const mes = Math.trunc(Number(d?.mes));
        const dia = Math.trunc(Number(d?.dia));
        if (!Number.isFinite(mes) || mes < 1 || mes > 12) throw new ErroAplicacao('meta.mes_invalido', 400);
        if (!Number.isFinite(dia) || dia < 1 || dia > 31) throw new ErroAplicacao('meta.dia_invalido', 400);
        const feriado = !!d?.feriado;
        return { mes, dia, valor: feriado ? 0 : naoNeg(d?.valor ?? 0), feriado };
      });
      await this.repo.salvarDiasAno(schema, ano, dias);
    }
  }

  // Mês corrente (para o painel TV). Deriva metaHoje/metaSemana/metaMes do CALENDÁRIO
  // (meta_dia) quando existe, com fallback no modelo dia útil/sábado. Também devolve o
  // mapa de meta por dia do mês (diasMeta) para o gráfico de barras da TV.
  async atual(schema: string): Promise<{ ano: number; mes: number } & MetaMes & {
    metaHoje: number; metaSemana: number; metaMes: number; diasMeta: number[];
  }> {
    const hoje = new Date();
    const ano = hoje.getFullYear(), mes = hoje.getMonth() + 1, dia = hoje.getDate();
    const m = await this.repo.obterMes(schema, ano, mes);
    const { porDia, total } = await this.repo.metaDiasMes(schema, ano, mes);
    const metaHoje = porDia[dia - 1] ?? 0;
    // Semana corrente (segunda→domingo): soma os dias dessa semana que caem no mês.
    const wdSeg = (hoje.getDay() + 6) % 7; // 0=segunda … 6=domingo
    const inicio = dia - wdSeg;
    let metaSemana = 0;
    for (let k = 0; k < 7; k++) { const dd = inicio + k; if (dd >= 1 && dd <= porDia.length) metaSemana += porDia[dd - 1]!; }
    const metaMes = total > 0 ? total : m.valor;
    return { ano, mes, ...m, metaHoje, metaSemana, metaMes, diasMeta: porDia };
  }

  // Meta por dia de um mês (YYYY-MM) — usado pelo drill de faturamento.
  async metasDoMes(schema: string, anoMes: string): Promise<{ porDia: number[]; total: number }> {
    const [ano, mes] = String(anoMes).split('-').map(Number);
    return this.repo.metaDiasMes(schema, ano!, mes!);
  }
}
