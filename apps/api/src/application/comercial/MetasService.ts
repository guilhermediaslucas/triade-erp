import { PERIODOS_META, type MetaRepository, type Metas, type PeriodoMeta } from '../../domain/comercial/Meta.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

export class MetasService {
  constructor(private readonly repo: MetaRepository) {}

  obter(schema: string): Promise<Metas> { return this.repo.obter(schema); }

  // Salva as metas informadas. Aceita um objeto parcial { dia?, semana?, mes?, ano? };
  // valores ausentes são ignorados, negativos viram 400.
  async salvar(schema: string, e: any): Promise<void> {
    for (const p of PERIODOS_META) {
      if (e?.[p] === undefined || e?.[p] === null || e?.[p] === '') continue;
      const v = Number(e[p]);
      if (!Number.isFinite(v) || v < 0) throw new ErroAplicacao('meta.valor_invalido', 400);
      await this.repo.definir(schema, p as PeriodoMeta, v);
    }
  }
}
