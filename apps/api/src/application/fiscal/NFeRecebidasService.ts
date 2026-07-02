import type { AmbienteFiscal, ConfigFiscalRepository } from '../../domain/fiscal/ConfigFiscal.js';
import type { ReceptorFiscal } from '../../domain/fiscal/ReceptorFiscal.js';
import type { NotaRecebida, NotaRecebidaRepository } from '../../domain/fiscal/NotaRecebida.js';
import type { TituloRepository } from '../../domain/financeiro/Titulo.js';
import type { EstoqueRepository } from '../../domain/estoque/Estoque.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

const isoOk = (v: any) => (v && /^\d{4}-\d{2}-\d{2}$/.test(String(v))) ? String(v) : null;
function venc30(): string { return new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10); }

// Item da importação escolhido pelo usuário no modal (entra ou não; a qual produto).
interface ItemImport { codigo: string; produtoId?: string | null; entra?: boolean; }
interface OpcoesImport {
  gerarTitulo?: boolean;
  vencimento?: string | null;
  categoriaFinanceiraId?: string | null;
  itens?: ItemImport[];
}

export class NFeRecebidasService {
  constructor(
    private readonly receptor: ReceptorFiscal,
    private readonly config: ConfigFiscalRepository,
    private readonly notas: NotaRecebidaRepository,
    private readonly titulos: TituloRepository,
    private readonly estoque: EstoqueRepository,
  ) {}

  private async tokenDe(empresaCodigo: string): Promise<{ ambiente: AmbienteFiscal; token: string }> {
    const c = await this.config.obter(empresaCodigo);
    if (!c) throw new ErroAplicacao('fiscal.nota.token_ausente', 400);
    const token = c.ambiente === 'producao' ? c.tokenProducao : c.tokenHomologacao;
    if (!token || token.trim() === '') throw new ErroAplicacao('fiscal.nota.token_ausente', 400);
    return { ambiente: c.ambiente, token };
  }

  // Consulta a Focus (com ciência automática) e guarda as notas novas. Retorna quantos vieram.
  async buscarNovas(schema: string, empresaCodigo: string): Promise<{ recebidas: number }> {
    const { ambiente, token } = await this.tokenDe(empresaCodigo);
    const recebidas = await this.receptor.listar(ambiente, token);
    for (const n of recebidas) {
      await this.notas.upsert(schema, {
        chave: n.chave, emitenteCnpj: n.emitenteCnpj, emitenteNome: n.emitenteNome,
        numero: n.numero, serie: n.serie, emissao: n.emissao, valor: n.valor, itens: n.itens,
      });
    }
    return { recebidas: recebidas.length };
  }

  // Lista as notas guardadas, sugerindo o produto de cada item pelo mapeamento salvo do fornecedor.
  async listar(schema: string, filtro: { status?: any; de?: any; ate?: any }): Promise<any[]> {
    const notas = await this.notas.listar(schema, { status: filtro.status || null, de: isoOk(filtro.de), ate: isoOk(filtro.ate) });
    const cache: Record<string, Record<string, string>> = {};
    const out: any[] = [];
    for (const n of notas) {
      const cnpj = n.emitenteCnpj ?? '';
      if (cnpj && !cache[cnpj]) cache[cnpj] = await this.notas.mapaFornecedor(schema, cnpj);
      const mapa = cnpj ? cache[cnpj]! : {};
      out.push({ ...n, itens: n.itens.map((it) => ({ ...it, sugestaoProdutoId: mapa[it.codigo] ?? null })) });
    }
    return out;
  }

  async importar(schema: string, chave: string, opcoes: OpcoesImport): Promise<{ tituloId: string | null; entradas: number }> {
    const nota = await this.notas.buscarPorChave(schema, chave);
    if (!nota) throw new ErroAplicacao('fiscal.recebida.nao_encontrada', 404);
    if (nota.status === 'importada') throw new ErroAplicacao('fiscal.recebida.ja_importada', 400);

    let tituloId: string | null = null;
    if (opcoes.gerarTitulo !== false) {
      const numeroDoc = nota.numero ? (nota.serie ? `${nota.numero} / ${nota.serie}` : nota.numero) : null;
      const descricao = 'NF-e recebida' + (nota.emitenteNome ? ' - ' + nota.emitenteNome : '') + (nota.numero ? ' (NF ' + nota.numero + ')' : '');
      tituloId = await this.titulos.criar(schema, {
        tipo: 'pagar', descricao, pessoaNome: nota.emitenteNome, valor: nota.valor,
        vencimento: isoOk(opcoes.vencimento) ?? venc30(), emissao: nota.emissao,
        numeroDocumento: numeroDoc, categoriaFinanceiraId: opcoes.categoriaFinanceiraId ?? null,
      } as any, 'compra', null);
    }

    // Entrada no estoque dos itens marcados (mapeados a um produto). Custo/qtd vêm da própria nota.
    let entradas = 0;
    const cnpj = nota.emitenteCnpj ?? '';
    for (const escolha of opcoes.itens ?? []) {
      if (!escolha.entra || !escolha.produtoId) continue;
      const item = nota.itens.find((i) => i.codigo === escolha.codigo);
      if (!item) continue;
      await this.estoque.registrarEntrada(schema, {
        produtoId: escolha.produtoId, lote: null, validade: null,
        quantidade: item.quantidade, custoUnitario: item.valorUnitario,
        fornecedor: nota.emitenteNome, nf: nota.numero, emissao: nota.emissao,
      });
      if (cnpj) await this.notas.salvarMapa(schema, cnpj, escolha.codigo, escolha.produtoId);
      entradas++;
    }

    await this.notas.marcarImportada(schema, chave, tituloId);
    return { tituloId, entradas };
  }
}
