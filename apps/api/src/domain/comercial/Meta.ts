// Metas comerciais da empresa (valor-alvo de faturamento por período).
export type PeriodoMeta = 'dia' | 'semana' | 'mes' | 'ano';
export const PERIODOS_META: PeriodoMeta[] = ['dia', 'semana', 'mes', 'ano'];

export interface Metas {
  dia: number;
  semana: number;
  mes: number;
  ano: number;
}

export interface MetaRepository {
  obter(schema: string): Promise<Metas>;
  definir(schema: string, periodo: PeriodoMeta, valor: number): Promise<void>;
}
