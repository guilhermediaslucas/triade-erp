export type FormaEntrega = 'retirada' | 'motoboy' | 'correios' | 'transportadora';
export const FORMAS_ENTREGA: FormaEntrega[] = ['retirada', 'motoboy', 'correios', 'transportadora'];

export interface FreteConfig { kmRate: number; minMotoboy: number; cepOrigem: string | null; }

export interface FreteConfigRepository {
  obter(schema: string): Promise<FreteConfig>;
  salvar(schema: string, c: FreteConfig): Promise<void>;
}
