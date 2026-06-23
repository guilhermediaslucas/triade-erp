import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';
import type { Cliente, ClienteRepository, EnderecoCliente, NovoCliente, TipoPessoa } from '../../domain/pessoa/Cliente.js';
import type { Fornecedor, FornecedorRepository, NovoFornecedor } from '../../domain/pessoa/Fornecedor.js';
import type { Vendedor, VendedorRepository, NovoVendedor } from '../../domain/pessoa/Vendedor.js';

function exigeNome(n: string): string {
  if (!n || n.trim().length < 2) throw new ErroAplicacao('cadastro.nome_invalido', 400);
  return n.trim();
}
// Documento é OPCIONAL (espelha o mockup): cliente/fornecedor podem ser salvos
// só com o nome; CPF/CNPJ pode ser preenchido depois. Vazio vira string vazia.
function docOpcional(d: any): string {
  return d == null ? '' : String(d).trim();
}
const limpo = (v: any): string | null => (v && String(v).trim() !== '' ? String(v).trim() : null);
const so = (v: any): string => String(v ?? '').replace(/\D/g, '');

function montarEnderecos(lista: any): EnderecoCliente[] {
  if (!Array.isArray(lista)) return [];
  const ends: EnderecoCliente[] = lista.map((e: any) => ({
    cep: limpo(e?.cep), logradouro: limpo(e?.logradouro), numero: limpo(e?.numero),
    complemento: limpo(e?.complemento), bairro: limpo(e?.bairro), cidade: limpo(e?.cidade),
    uf: limpo(e?.uf), favorito: !!e?.favorito,
  }));
  // garante no maximo um favorito; se houver endereco e nenhum favorito, marca o primeiro
  const favs = ends.filter((e) => e.favorito);
  if (favs.length > 1) { ends.forEach((e, i) => { e.favorito = i === ends.findIndex((x) => x.favorito); }); }
  if (ends.length > 0 && !ends.some((e) => e.favorito)) ends[0]!.favorito = true;
  return ends;
}

export class ClientesService {
  constructor(private readonly repo: ClienteRepository) {}
  listar(s: string): Promise<Cliente[]> { return this.repo.listar(s); }
  private montar(e: any): NovoCliente {
    const tipoPessoa: TipoPessoa = e?.tipoPessoa === 'PF' ? 'PF' : 'PJ';
    const limite = Number(e?.limiteCredito ?? 0);
    if (!Number.isFinite(limite) || limite < 0) throw new ErroAplicacao('pessoa.limite_invalido', 400);
    const enderecos = montarEnderecos(e?.enderecos);
    return {
      tipoPessoa, nome: exigeNome(e?.nome), fantasia: tipoPessoa === 'PJ' ? limpo(e?.fantasia) : null,
      documento: docOpcional(e?.documento), email: limpo(e?.email), telefone: limpo(e?.telefone), limiteCredito: limite,
      enderecos,
    };
  }
  criar(s: string, e: any): Promise<string> { return this.repo.criar(s, this.montar(e)); }
  async editar(s: string, id: string, e: any): Promise<void> {
    if (!(await this.repo.buscarPorId(s, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.atualizar(s, id, this.montar(e));
  }
  async alternarAtivo(s: string, id: string, ativo: boolean): Promise<void> {
    if (!(await this.repo.buscarPorId(s, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.definirAtivo(s, id, ativo);
  }

  // Importação em lote (CSV/XLSX já normalizado em JSON pelo front).
  // Dedup por documento (dígitos) e, na falta dele, por nome. Erro por linha não
  // aborta o lote — volta no relatório.
  async importar(s: string, linhas: any[]): Promise<{ criados: number; ignorados: number; erros: { linha: number; motivo: string }[] }> {
    const lista = Array.isArray(linhas) ? linhas : [];
    const existentes = await this.repo.listar(s);
    const docs = new Set(existentes.map((c) => so(c.documento)).filter(Boolean));
    const nomes = new Set(existentes.map((c) => c.nome.toLowerCase().trim()));
    let criados = 0, ignorados = 0; const erros: { linha: number; motivo: string }[] = [];
    for (let i = 0; i < lista.length; i++) {
      try {
        const novo = this.montar(lista[i] ?? {});
        const docN = so(novo.documento);
        const nomeN = novo.nome.toLowerCase().trim();
        if ((docN && docs.has(docN)) || nomes.has(nomeN)) { ignorados++; continue; }
        await this.repo.criar(s, novo);
        if (docN) docs.add(docN);
        nomes.add(nomeN);
        criados++;
      } catch (err) {
        erros.push({ linha: i + 1, motivo: err instanceof ErroAplicacao ? err.chaveI18n : 'cadastro.import_erro_linha' });
      }
    }
    return { criados, ignorados, erros };
  }
}

export class FornecedoresService {
  constructor(private readonly repo: FornecedorRepository) {}
  listar(s: string): Promise<Fornecedor[]> { return this.repo.listar(s); }
  private montar(e: any): NovoFornecedor {
    return { nome: exigeNome(e?.nome), fantasia: limpo(e?.fantasia), documento: docOpcional(e?.documento), email: limpo(e?.email), telefone: limpo(e?.telefone), cep: limpo(e?.cep), cidade: limpo(e?.cidade), uf: limpo(e?.uf), logradouro: limpo(e?.logradouro), numero: limpo(e?.numero), complemento: limpo(e?.complemento), bairro: limpo(e?.bairro) };
  }
  criar(s: string, e: any): Promise<string> { return this.repo.criar(s, this.montar(e)); }
  async editar(s: string, id: string, e: any): Promise<void> {
    if (!(await this.repo.buscarPorId(s, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.atualizar(s, id, this.montar(e));
  }
  async alternarAtivo(s: string, id: string, ativo: boolean): Promise<void> {
    if (!(await this.repo.buscarPorId(s, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.definirAtivo(s, id, ativo);
  }

  // Importação em lote (CSV/XLSX normalizado no front). Dedup por documento (dígitos)
  // e, na falta, por nome. Erro por linha não aborta o lote.
  async importar(s: string, linhas: any[]): Promise<{ criados: number; ignorados: number; erros: { linha: number; motivo: string }[] }> {
    const lista = Array.isArray(linhas) ? linhas : [];
    const existentes = await this.repo.listar(s);
    const docs = new Set(existentes.map((c) => so(c.documento)).filter(Boolean));
    const nomes = new Set(existentes.map((c) => c.nome.toLowerCase().trim()));
    let criados = 0, ignorados = 0; const erros: { linha: number; motivo: string }[] = [];
    for (let i = 0; i < lista.length; i++) {
      try {
        const novo = this.montar(lista[i] ?? {});
        const docN = so(novo.documento);
        const nomeN = novo.nome.toLowerCase().trim();
        if ((docN && docs.has(docN)) || nomes.has(nomeN)) { ignorados++; continue; }
        await this.repo.criar(s, novo);
        if (docN) docs.add(docN);
        nomes.add(nomeN);
        criados++;
      } catch (err) {
        erros.push({ linha: i + 1, motivo: err instanceof ErroAplicacao ? err.chaveI18n : 'cadastro.import_erro_linha' });
      }
    }
    return { criados, ignorados, erros };
  }
}

export class VendedoresService {
  constructor(private readonly repo: VendedorRepository) {}
  listar(s: string): Promise<Vendedor[]> { return this.repo.listar(s); }
  private montar(e: any): NovoVendedor {
    const c = Number(e?.comissaoPercentual ?? 0);
    if (!Number.isFinite(c) || c < 0 || c > 100) throw new ErroAplicacao('vendedor.comissao_invalida', 400);
    const meta = Number(e?.metaMensal ?? 0);
    if (!Number.isFinite(meta) || meta < 0) throw new ErroAplicacao('vendedor.meta_invalida', 400);
    return { nome: exigeNome(e?.nome), email: limpo(e?.email), telefone: limpo(e?.telefone), regiao: limpo(e?.regiao), metaMensal: meta, comissaoPercentual: c, segueRegraGeral: !!e?.segueRegraGeral };
  }
  criar(s: string, e: any): Promise<string> { return this.repo.criar(s, this.montar(e)); }
  async editar(s: string, id: string, e: any): Promise<void> {
    if (!(await this.repo.buscarPorId(s, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.atualizar(s, id, this.montar(e));
  }
  async alternarAtivo(s: string, id: string, ativo: boolean): Promise<void> {
    if (!(await this.repo.buscarPorId(s, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.definirAtivo(s, id, ativo);
  }
}
