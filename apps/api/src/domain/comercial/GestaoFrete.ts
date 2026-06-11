// Apuração dos fretes de motoboy por período, agrupados por motoboy (para pagamento).
export interface LinhaFreteMotoboy {
  motoboyId: string;
  motoboy: string;
  qtdPedidos: number;
  totalFrete: number;
}

export interface GestaoFreteRepository {
  apurar(schema: string, de: string | null, ate: string | null): Promise<LinhaFreteMotoboy[]>;
}
