// Metas comerciais por mês (valor-alvo de faturamento). O ano é a soma dos 12 meses.
// Cada mês pode ter o total digitado direto ou diluído por dia útil (seg–sex) e sábado.
export interface MetaMes {
  mes: number;          // 1..12
  valor: number;        // meta total do mês
  metaDiaUtil: number;  // meta diária de dias úteis (seg–sex) — usada na diluição e na TV
  metaSabado: number;   // meta diária de sábado
}

// Ajuste fino da meta por dia específico (calendário). Quando há linhas para um mês,
// o total do mês = soma dos dias; feriado = dia sem meta.
export interface MetaDia {
  mes: number;     // 1..12
  dia: number;     // 1..31
  valor: number;
  feriado: boolean;
}

export interface MetaRepository {
  // Retorna as 12 linhas do ano (preenchendo com zeros os meses sem registro).
  listarAno(schema: string, ano: number): Promise<MetaMes[]>;
  // Upsert das linhas informadas para o ano.
  salvarAno(schema: string, ano: number, meses: MetaMes[]): Promise<void>;
  // Ajuste por dia (calendário) — todos os dias cadastrados do ano.
  listarDiasAno(schema: string, ano: number): Promise<MetaDia[]>;
  // Substitui o conjunto de dias do ano pelo informado.
  salvarDiasAno(schema: string, ano: number, dias: MetaDia[]): Promise<void>;
  // Linha de um mês específico (ou zeros se não houver) — usado pelo dashboard/TV.
  obterMes(schema: string, ano: number, mes: number): Promise<MetaMes>;
  // Mapa 'YYYY-MM' -> valor do mês, para os meses pedidos (dashboard).
  valoresPorMes(schema: string, meses: { ano: number; mes: number }[]): Promise<Record<string, number>>;
}
