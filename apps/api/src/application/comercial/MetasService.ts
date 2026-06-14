import type { MetaMes, MetaRepository } from '../../domain/comercial/Meta.js';
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

  async salvar(schema: string, e: any): Promise<void> {
    const ano = anoValido(e?.ano);
    const lista: any[] = Array.isArray(e?.meses) ? e.meses : [];
    const meses: MetaMes[] = lista.map((m) => {
      const mes = Math.trunc(Number(m?.mes));
      if (!Number.isFinite(mes) || mes < 1 || mes > 12) throw new ErroAplicacao('meta.mes_invalido', 400);
      return { mes, valor: naoNeg(m?.valor ?? 0), metaDiaUtil: naoNeg(m?.metaDiaUtil ?? 0), metaSabado: naoNeg(m?.metaSabado ?? 0) };
    });
    await this.repo.salvarAno(schema, ano, meses);
  }

  // Mês corrente (para o painel TV derivar dia/semana/mês). Usa a data do servidor.
  async atual(schema: string): Promise<{ ano: number; mes: number } & MetaMes> {
    const hoje = new Date();
    const ano = hoje.getFullYear(), mes = hoje.getMonth() + 1;
    const m = await this.repo.obterMes(schema, ano, mes);
    return { ano, mes, ...m };
  }
}
