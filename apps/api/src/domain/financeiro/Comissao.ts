export interface LinhaComissao { vendedorId: string; vendedor: string; percentual: number; vendido: number; comissao: number; }
export interface ComissaoRepository {
  apurar(schema: string, de: string | null, ate: string | null): Promise<LinhaComissao[]>;
}
