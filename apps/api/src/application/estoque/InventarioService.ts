import type { EstoqueRepository } from '../../domain/estoque/Estoque.js';
import type { EtiquetaRepository } from '../../domain/estoque/Etiqueta.js';
import type { FaltanteInventario, InventarioRepository, InventarioResumo } from '../../domain/estoque/Inventario.js';

export interface ResultadoInventario {
  id: string; responsavel: string | null;
  esperadas: number; encontradas: number; faltantes: number; desconhecidas: number;
  baixouPerda: boolean; faltantesDetalhe: FaltanteInventario[];
}

export class InventarioService {
  constructor(
    private readonly inventarios: InventarioRepository,
    private readonly etiquetas: EtiquetaRepository,
    private readonly estoque: EstoqueRepository,
  ) {}

  listar(schema: string): Promise<InventarioResumo[]> { return this.inventarios.listar(schema); }
  faltantesDe(schema: string, id: string): Promise<FaltanteInventario[]> { return this.inventarios.faltantesDe(schema, id); }

  // Finaliza a contagem: compara os codigos lidos com as etiquetas em estoque.
  // baixarPerda = true zera as faltantes (status perda + baixa do lote).
  async finalizar(schema: string, e: any): Promise<ResultadoInventario> {
    const responsavel = (e?.responsavel && String(e.responsavel).trim()) || null;
    const lidos = Array.isArray(e?.codigos)
      ? e.codigos.map((c: any) => String(c).trim().toUpperCase()).filter(Boolean)
      : [];
    const setLidos = new Set<string>(lidos);
    const baixarPerda = !!e?.baixarPerda;

    const esperadas = await this.etiquetas.listarEmEstoque(schema);
    const setEsperadas = new Set(esperadas.map((x) => x.codigo));
    const encontradas = esperadas.filter((x) => setLidos.has(x.codigo));
    const faltantes = esperadas.filter((x) => !setLidos.has(x.codigo));
    const desconhecidas = [...setLidos].filter((c) => !setEsperadas.has(c)).length;

    if (baixarPerda) {
      for (const ft of faltantes) {
        await this.estoque.baixarUnidadeLotePerda(schema, ft.loteId, ft.produtoId, 'Ajuste de inventário');
        await this.etiquetas.consumir(schema, ft.codigo, 'perda');
      }
    }

    const faltantesDetalhe: FaltanteInventario[] = faltantes.map((ft) => ({
      codigo: ft.codigo, produtoNome: ft.produtoNome, lote: ft.lote, validade: ft.validade,
    }));
    const baixou = baixarPerda && faltantes.length > 0;
    const id = await this.inventarios.criar(schema, {
      responsavel, esperadas: esperadas.length, encontradas: encontradas.length,
      faltantes: faltantes.length, baixouPerda: baixou,
    }, faltantesDetalhe);

    return {
      id, responsavel, esperadas: esperadas.length, encontradas: encontradas.length,
      faltantes: faltantes.length, desconhecidas, baixouPerda: baixou, faltantesDetalhe,
    };
  }
}
