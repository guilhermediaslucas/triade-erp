import type { EmpresaRepository } from '../../domain/empresa/EmpresaRepository.js';
import type { UsuarioRepository } from '../../domain/usuario/UsuarioRepository.js';
import type { PerfilRepository } from '../../domain/perfil/PerfilRepository.js';
import type { HashSenha } from '../../domain/ports/HashSenha.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

export interface SincronizarAcessoEntrada {
  email: string;
  nome: string;
  perfilNome: string;          // perfil escolhido pelo NOME; resolvido em cada empresa
  empresas: string[];          // códigos das empresas que o login deve acessar
  senha?: string | null;       // opcional: senha provisória (se vazia, reusa a senha existente)
  trocarSenha?: boolean;       // exigir troca de senha no próximo login
}

export interface AcessoEmpresaInfo {
  codigo: string;
  fantasia: string;
  temAcesso: boolean;          // o e-mail é usuário ATIVO nesta empresa
  existe: boolean;             // existe (ativo ou inativo) nesta empresa
  perfilNome: string | null;
}

// Situação resolvida: além das empresas, devolve o e-mail/nome/perfil canônicos do
// login encontrado (para a tela pré-preencher os campos — busca por e-mail OU nome).
export interface SituacaoAcesso {
  email: string;
  nome: string;
  perfilNome: string | null;
  empresas: AcessoEmpresaInfo[];
}

// Caso de uso (super-admin): vincula UM login (e-mail) a várias empresas sem
// recadastrar. Modelo schema-por-tenant: "ter acesso" = ser usuário ativo no
// schema do tenant. Aqui criamos/reativamos onde marcado e inativamos onde
// desmarcado, mantendo a MESMA senha entre empresas (reaproveita o login
// multi-empresa já existente). O perfil é resolvido pelo nome em cada empresa.
export class AcessoMultiEmpresa {
  constructor(
    private readonly empresas: EmpresaRepository,
    private readonly usuarios: UsuarioRepository,
    private readonly perfis: PerfilRepository,
    private readonly hash: HashSenha,
  ) {}

  // Situação atual do login em cada empresa ativa (para a tela do super-admin).
  // `termo` aceita E-MAIL (contém @) OU NOME — resolve o login e devolve email/nome/perfil
  // canônicos + a situação por empresa, para a tela pré-preencher os campos.
  async situacao(termoEntrada: string): Promise<SituacaoAcesso> {
    const termo = String(termoEntrada ?? '').trim();
    const ativas = (await this.empresas.listarTodas()).filter((e) => e.ativo);

    // Resolve o e-mail canônico: se o termo é um e-mail, usa direto; se é um nome,
    // procura o 1º usuário cujo nome casa (contém) em alguma empresa.
    let email = termo.includes('@') ? termo.toLowerCase() : '';
    let nome = '';
    if (!email && termo) {
      const alvo = termo.toLowerCase();
      for (const e of ativas) {
        const u = (await this.usuarios.listar(e.schemaName)).find((x) => x.nome.toLowerCase().includes(alvo));
        if (u) { email = u.email.toLowerCase(); nome = u.nome; break; }
      }
    }

    let perfilNomeTop: string | null = null;
    const empresas: AcessoEmpresaInfo[] = [];
    for (const e of ativas) {
      const u = email ? await this.usuarios.buscarPorEmail(e.schemaName, email) : null;
      if (u && !nome) nome = u.nome;
      let perfilNome: string | null = null;
      if (u && u.perfilId) {
        const p = (await this.perfis.listar(e.schemaName)).find((x) => x.id === u.perfilId);
        perfilNome = p?.nome ?? null;
      }
      if (perfilNome && !perfilNomeTop) perfilNomeTop = perfilNome;
      empresas.push({ codigo: e.codigo, fantasia: e.fantasia, temAcesso: !!(u && u.ativo), existe: !!u, perfilNome });
    }
    return { email, nome, perfilNome: perfilNomeTop, empresas };
  }

  async sincronizar(e: SincronizarAcessoEntrada): Promise<{ adicionadas: string[]; removidas: string[] }> {
    const email = String(e.email ?? '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new ErroAplicacao('usuario.email_invalido', 400);
    const nome = String(e.nome ?? '').trim();
    if (nome.length < 2) throw new ErroAplicacao('usuario.nome_invalido', 400);
    const senha = String(e.senha ?? '').trim();
    if (senha && senha.length < 6) throw new ErroAplicacao('usuario.senha_curta', 400);
    const perfilNomeAlvo = String(e.perfilNome ?? '').trim().toLowerCase();
    const selecionadas = new Set((e.empresas ?? []).map((c) => String(c).trim().toLowerCase()));
    const trocarSenha = e.trocarSenha === true;

    const todas = (await this.empresas.listarTodas()).filter((x) => x.ativo);

    // Senha a usar ao CRIAR o login numa empresa nova: a informada (hasheada) ou,
    // se não houver, a senha já existente do mesmo e-mail em alguma empresa.
    let senhaHash: string | null = senha ? await this.hash.gerar(senha) : null;
    if (!senhaHash) {
      for (const emp of todas) {
        const u = await this.usuarios.buscarPorEmail(emp.schemaName, email);
        if (u) { senhaHash = u.senhaHash; break; }
      }
    }

    const adicionadas: string[] = [];
    const removidas: string[] = [];

    for (const emp of todas) {
      const marcada = selecionadas.has(emp.codigo.toLowerCase());
      const existente = await this.usuarios.buscarPorEmail(emp.schemaName, email);

      if (marcada) {
        // Resolve o perfil pelo nome dentro do schema desta empresa.
        const perfil = (await this.perfis.listar(emp.schemaName)).find((p) => p.nome.trim().toLowerCase() === perfilNomeAlvo);
        const perfilId = perfil?.id ?? null;
        if (existente) {
          await this.usuarios.atualizar(emp.schemaName, existente.id, nome, perfilId, existente.foto, existente.vendedorId);
          if (!existente.ativo) await this.usuarios.definirAtivo(emp.schemaName, existente.id, true);
          if (senha) {
            await this.usuarios.definirSenha(emp.schemaName, existente.id, senhaHash!);
            await this.usuarios.definirTrocarSenha(emp.schemaName, existente.id, trocarSenha);
          }
          if (!existente.ativo) adicionadas.push(emp.codigo);
        } else {
          if (!senhaHash) throw new ErroAplicacao('usuario.senha_curta', 400); // login novo precisa de senha
          // Só força troca quando há senha provisória nova; se reusou a senha
          // existente do login (já conhecida pelo usuário), não força.
          await this.usuarios.criar(emp.schemaName, { nome, email, senhaHash, perfilId, trocarSenha: senha ? trocarSenha : false });
          adicionadas.push(emp.codigo);
        }
      } else if (existente && existente.ativo) {
        // Desmarcada: revoga o acesso (inativa, preservando histórico/FKs).
        await this.usuarios.definirAtivo(emp.schemaName, existente.id, false);
        removidas.push(emp.codigo);
      }
    }
    return { adicionadas, removidas };
  }
}
