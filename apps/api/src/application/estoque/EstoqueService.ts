import type { EstoqueRepository, PosicaoProduto } from '../../domain/estoque/Estoque.js';
import type { Etiqueta, EtiquetaConsulta, EtiquetaRepository } from '../../domain/estoque/Etiqueta.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

export class EstoqueService {
  constructor(
    private readonly repo: EstoqueRepository,
    private readonly etiquetas: EtiquetaRepository,
  ) {}
  posicao(schema: string): Promise<PosicaoProduto[]> { return this.repo.posicao(schema); }

  etiquetasDoLote(schema: string, loteId: string): Promise<Etiqueta[]> {
    return this.etiquetas.listarPorLote(schema, loteId);
  }

  // Bipar um código: traz produto, lote e validade (usado na consulta e na separação).
  async consultarEtiqueta(schema: string, codigo: string): Promise<EtiquetaConsulta> {
    const cod = (codigo && String(codigo).trim()) || '';
    if (!cod) throw new ErroAplicacao('etiqueta.codigo_invalido', 400);
    const et = await this.etiquetas.buscarPorCodigo(schema, cod.toUpperCase());
    if (!et) throw new ErroAplicacao('etiqueta.nao_encontrada', 404);
    return et;
  }

  // Entrada por BIPAGEM: o usuário lê as etiquetas já afixadas nos produtos.
  // A quantidade é o número de códigos lidos; o sistema não gera códigos.
  async entrada(schema: string, e: any): Promise<void> {
    if (!e?.produtoId || !(await this.repo.produtoExiste(schema, e.produtoId))) throw new ErroAplicacao('pedido.produto_invalido', 400);
    const custo = Number(e?.custoUnitario ?? 0);
    if (!Number.isFinite(custo) || custo < 0) throw new ErroAplicacao('estoque.custo_invalido', 400);
    const validade = (e?.validade && String(e.validade).trim()) || null;
    const lote = (e?.lote && String(e.lote).trim()) || null;

    const codigos = Array.isArray(e?.codigos)
      ? e.codigos.map((c: any) => String(c).trim().toUpperCase()).filter(Boolean)
      : [];
    if (codigos.length === 0) throw new ErroAplicacao('etiqueta.bipe_obrigatorio', 400);
    // Não pode repetir código dentro da própria leitura.
    if (new Set(codigos).size !== codigos.length) throw new ErroAplicacao('etiqueta.duplicada_leitura', 400);
    // Não pode reutilizar um código que já está no estoque.
    const jaExistem = await this.etiquetas.jaExistem(schema, codigos);
    if (jaExistem.length > 0) throw new ErroAplicacao('etiqueta.duplicada', 409);

    await this.repo.registrarEntrada(schema, {
      produtoId: e.produtoId, lote, validade, quantidade: codigos.length, custoUnitario: custo, codigos,
      fornecedor: (e?.fornecedor && String(e.fornecedor).trim()) || null,
      nf: (e?.nf && String(e.nf).trim()) || null,
      emissao: (e?.emissao && /^\d{4}-\d{2}-\d{2}$/.test(String(e.emissao))) ? String(e.emissao) : null,
    });
  }

  async baixaPerda(schema: string, e: any): Promise<void> {
    const quantidade = Number(e?.quantidade);
    if (!Number.isFinite(quantidade) || quantidade <= 0) throw new ErroAplicacao('estoque.qtd_invalida', 400);
    const motivo = (e?.motivo && String(e.motivo).trim()) || '';
    if (motivo.length < 2) throw new ErroAplicacao('estoque.motivo_invalido', 400);
    const lote = await this.repo.saldoLote(schema, e?.loteId);
    if (!lote) throw new ErroAplicacao('estoque.lote_invalido', 404);
    if (quantidade > lote.saldo) throw new ErroAplicacao('estoque.insuficiente', 409);
    await this.repo.baixarLote(schema, e.loteId, lote.produtoId, quantidade, motivo);
  }
}
