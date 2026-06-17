import type { PedidoRepository } from '../../domain/comercial/Pedido.js';
import type { ProdutoRepository } from '../../domain/cadastro/Produto.js';
import type { ClienteRepository } from '../../domain/pessoa/Cliente.js';
import type { EmpresaRepository } from '../../domain/empresa/EmpresaRepository.js';
import type { ConfigFiscalRepository, AmbienteFiscal } from '../../domain/fiscal/ConfigFiscal.js';
import type { NotaFiscal, NotaFiscalRepository, StatusNota } from '../../domain/fiscal/NotaFiscal.js';
import type { ArquivoFiscal, DadosEmissaoNF, EmissorFiscal, ItemNF } from '../../domain/fiscal/EmissorFiscal.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

function mapStatus(focus: string): StatusNota {
  if (focus === 'autorizado') return 'autorizado';
  if (focus === 'processando_autorizacao') return 'processando';
  if (focus === 'cancelado') return 'cancelado';
  return 'erro';
}

export class NotasFiscaisService {
  constructor(
    private readonly notas: NotaFiscalRepository,
    private readonly pedidos: PedidoRepository,
    private readonly produtos: ProdutoRepository,
    private readonly clientes: ClienteRepository,
    private readonly empresas: EmpresaRepository,
    private readonly config: ConfigFiscalRepository,
    private readonly emissor: EmissorFiscal,
  ) {}

  private async tokenDe(empresaCodigo: string): Promise<{ ambiente: AmbienteFiscal; token: string }> {
    const c = await this.config.obter(empresaCodigo);
    if (!c) throw new ErroAplicacao('fiscal.nota.token_ausente', 400);
    const token = c.ambiente === 'producao' ? c.tokenProducao : c.tokenHomologacao;
    if (!token || token.trim() === '') throw new ErroAplicacao('fiscal.nota.token_ausente', 400);
    return { ambiente: c.ambiente, token };
  }

  async emitir(schema: string, empresaCodigo: string, pedidoId: string): Promise<NotaFiscal> {
    const pedido = await this.pedidos.buscarPorId(schema, pedidoId);
    if (!pedido) throw new ErroAplicacao('pedido.nao_encontrado', 404);
    if (pedido.status !== 'expedido' && pedido.status !== 'entregue') throw new ErroAplicacao('fiscal.nota.status_invalido', 400);

    const existente = await this.notas.buscarPorPedido(schema, pedidoId);
    if (existente && (existente.status === 'autorizado' || existente.status === 'processando')) {
      throw new ErroAplicacao('fiscal.nota.ja_emitida', 409);
    }

    const empresa = await this.empresas.buscarPorCodigo(empresaCodigo);
    if (!empresa) throw new ErroAplicacao('empresa.nao_encontrada', 404);
    const cfg = await this.config.obter(empresaCodigo);
    if (!cfg) throw new ErroAplicacao('fiscal.nota.token_ausente', 400);

    // Emitente completo?
    if (!empresa.cnpj || !empresa.inscricaoEstadual || !empresa.logradouro || !cfg.numeroEmitente
        || !empresa.bairro || !empresa.cidade || !empresa.uf || !empresa.cep) {
      throw new ErroAplicacao('fiscal.nota.emitente_incompleto', 400);
    }
    const token = cfg.ambiente === 'producao' ? cfg.tokenProducao : cfg.tokenHomologacao;
    if (!token || token.trim() === '') throw new ErroAplicacao('fiscal.nota.token_ausente', 400);

    // Destinatário
    if (!pedido.clienteId) throw new ErroAplicacao('fiscal.nota.sem_cliente', 400);
    const cliente = await this.clientes.buscarPorId(schema, pedido.clienteId);
    if (!cliente) throw new ErroAplicacao('fiscal.nota.sem_cliente', 400);
    const end = cliente.enderecos.find((e) => e.favorito) ?? cliente.enderecos[0];
    if (!end || !end.logradouro || !end.cidade || !end.uf || !cliente.documento) {
      throw new ErroAplicacao('fiscal.nota.destinatario_incompleto', 400);
    }

    const simples = cfg.regimeTributario === 1 || cfg.regimeTributario === 2;
    const mesmaUf = empresa.uf === end.uf;

    // Itens (puxam o fiscal do produto; NCM é obrigatório)
    const itens: ItemNF[] = [];
    let n = 1;
    for (const it of pedido.itens) {
      const prod = it.produtoId ? await this.produtos.buscarPorId(schema, it.produtoId) : null;
      const ncm = prod?.ncm ? prod.ncm.replace(/\D/g, '') : '';
      if (ncm.length !== 8) throw new ErroAplicacao('fiscal.nota.sem_ncm', 400);
      itens.push({
        numeroItem: n++,
        codigo: it.produtoId ?? String(n),
        descricao: it.produtoNome,
        ncm,
        cfop: (prod?.cfop && prod.cfop.trim()) || (mesmaUf ? cfg.cfopDentroUf : cfg.cfopForaUf),
        unidade: (prod?.unidade && prod.unidade.trim()) || 'UN',
        quantidade: it.quantidade,
        valorUnitario: it.precoUnitario,
        valorBruto: it.subtotal,
        icmsOrigem: prod?.origemFiscal != null && prod.origemFiscal !== '' ? Number(prod.origemFiscal) : cfg.icmsOrigem,
        icmsCst: (prod?.cstFiscal && prod.cstFiscal.trim()) || (simples ? cfg.csosnPadrao : cfg.cstIcmsPadrao),
        icmsAliquota: simples ? 0 : cfg.aliquotaIcms,
        pisCst: cfg.pisCstPadrao,
        cofinsCst: cfg.cofinsCstPadrao,
      });
    }
    if (itens.length === 0) throw new ErroAplicacao('fiscal.nota.sem_itens', 400);

    const dados: DadosEmissaoNF = {
      naturezaOperacao: cfg.naturezaOperacao,
      emitente: {
        cnpj: empresa.cnpj, inscricaoEstadual: empresa.inscricaoEstadual, nome: empresa.nome,
        logradouro: empresa.logradouro, numero: cfg.numeroEmitente, complemento: cfg.complementoEmitente,
        bairro: empresa.bairro, municipio: empresa.cidade, uf: empresa.uf, cep: empresa.cep,
        regime: cfg.regimeTributario,
      },
      destinatario: {
        nome: cliente.nome, documento: cliente.documento, pessoaFisica: cliente.tipoPessoa === 'PF',
        logradouro: end.logradouro!, numero: end.numero ?? 'SN', bairro: end.bairro ?? '',
        municipio: end.cidade!, uf: end.uf!, cep: end.cep ?? '', telefone: cliente.telefone,
      },
      itens,
      valorProdutos: pedido.subtotal,
      valorFrete: pedido.frete,
      valorTotal: pedido.total,
    };

    const ref = `${empresaCodigo}-${pedido.numero}-${Date.now().toString(36)}`;
    await this.notas.criar(schema, pedidoId, ref);
    const resp = await this.emissor.emitir(cfg.ambiente, token, ref, dados);
    await this.notas.atualizar(schema, ref, {
      status: mapStatus(resp.status), statusFocus: resp.status, statusSefaz: resp.statusSefaz,
      mensagemSefaz: resp.mensagemSefaz, chave: resp.chave, numero: resp.numero, serie: resp.serie,
      caminhoDanfe: resp.caminhoDanfe, caminhoXml: resp.caminhoXml,
    });
    return (await this.notas.buscarPorRef(schema, ref))!;
  }

  // Estado atual da nota do pedido; se ainda está "processando", consulta a Focus e atualiza.
  async statusAtual(schema: string, empresaCodigo: string, pedidoId: string): Promise<NotaFiscal | null> {
    const nota = await this.notas.buscarPorPedido(schema, pedidoId);
    if (!nota) return null;
    if (nota.status !== 'processando') return nota;
    const { ambiente, token } = await this.tokenDe(empresaCodigo);
    const resp = await this.emissor.consultar(ambiente, token, nota.ref);
    await this.notas.atualizar(schema, nota.ref, {
      status: mapStatus(resp.status), statusFocus: resp.status, statusSefaz: resp.statusSefaz,
      mensagemSefaz: resp.mensagemSefaz, chave: resp.chave, numero: resp.numero, serie: resp.serie,
      caminhoDanfe: resp.caminhoDanfe, caminhoXml: resp.caminhoXml,
    });
    return (await this.notas.buscarPorRef(schema, nota.ref))!;
  }

  async baixar(schema: string, empresaCodigo: string, pedidoId: string, tipo: 'danfe' | 'xml'): Promise<ArquivoFiscal> {
    const nota = await this.notas.buscarPorPedido(schema, pedidoId);
    if (!nota || nota.status !== 'autorizado') throw new ErroAplicacao('fiscal.nota.indisponivel', 400);
    const caminho = tipo === 'xml' ? nota.caminhoXml : nota.caminhoDanfe;
    if (!caminho) throw new ErroAplicacao('fiscal.nota.indisponivel', 400);
    const { ambiente, token } = await this.tokenDe(empresaCodigo);
    return this.emissor.baixarArquivo(ambiente, token, caminho);
  }

  // Cancela a NF-e (só se autorizada). Justificativa 15–255. Só vira 'cancelado' no sucesso;
  // se a SEFAZ/Focus recusar (fora do prazo, já cancelada, etc.), preserva a nota e devolve o erro.
  async cancelar(schema: string, empresaCodigo: string, pedidoId: string, justificativa: string): Promise<NotaFiscal> {
    const j = String(justificativa ?? '').trim();
    if (j.length < 15 || j.length > 255) throw new ErroAplicacao('fiscal.nota.justificativa_invalida', 400);
    const nota = await this.notas.buscarPorPedido(schema, pedidoId);
    if (!nota || nota.status !== 'autorizado') throw new ErroAplicacao('fiscal.nota.nao_cancelavel', 400);
    const { ambiente, token } = await this.tokenDe(empresaCodigo);
    const resp = await this.emissor.cancelar(ambiente, token, nota.ref, j);
    if (mapStatus(resp.status) !== 'cancelado') {
      throw new ErroAplicacao(resp.mensagemSefaz || 'fiscal.nota.cancelamento_falhou', 400);
    }
    await this.notas.atualizar(schema, nota.ref, {
      status: 'cancelado', statusFocus: resp.status, statusSefaz: resp.statusSefaz,
      mensagemSefaz: resp.mensagemSefaz, chave: resp.chave ?? nota.chave,
      numero: resp.numero ?? nota.numero, serie: resp.serie ?? nota.serie,
      caminhoDanfe: nota.caminhoDanfe, caminhoXml: nota.caminhoXml,
    });
    return (await this.notas.buscarPorRef(schema, nota.ref))!;
  }
}
