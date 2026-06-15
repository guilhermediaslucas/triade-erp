import type { Chamado, ChamadoRepository, NovoChamado, StatusChamado, TipoChamado } from '../../domain/superadmin/Chamado.js';
import { STATUS_CHAMADO, TIPOS_CHAMADO } from '../../domain/superadmin/Chamado.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

// Contexto do usuário autenticado que abre o chamado (vem do token, não do corpo).
export interface ContextoChamado {
  empresaCodigo: string;
  usuarioNome: string;
  usuarioEmail: string;
}

// Limite do print (data URI). Mesmo critério da foto de usuário (~2,8MB) p/ não
// estourar o payload (express.json limit 3mb).
function normalizarPrint(print?: string | null): string | null {
  const p = (print ?? '').trim();
  if (!p) return null;
  if (!p.startsWith('data:image/')) throw new ErroAplicacao('suporte.print_invalido', 400);
  if (p.length > 2_800_000) throw new ErroAplicacao('suporte.print_grande', 400);
  return p;
}

export class SuporteService {
  constructor(private readonly repo: ChamadoRepository) {}

  listar(): Promise<Chamado[]> { return this.repo.listar(); }
  contarAbertos(): Promise<number> { return this.repo.contarAbertos(); }

  async abrir(ctx: ContextoChamado, e: any): Promise<string> {
    const tipo = String(e?.tipo ?? '').trim() as TipoChamado;
    if (!TIPOS_CHAMADO.includes(tipo)) throw new ErroAplicacao('suporte.tipo_invalido', 400);
    const assunto = String(e?.assunto ?? '').trim();
    if (assunto.length < 3) throw new ErroAplicacao('suporte.assunto_invalido', 400);
    const descricao = String(e?.descricao ?? '').trim();
    if (descricao.length < 3) throw new ErroAplicacao('suporte.descricao_invalida', 400);

    const novo: NovoChamado = {
      tipo,
      assunto,
      descricao,
      print: normalizarPrint(e?.print),
      tela: String(e?.tela ?? '').trim().slice(0, 200),
      versao: String(e?.versao ?? '').trim().slice(0, 40),
      empresaCodigo: ctx.empresaCodigo,
      usuarioNome: ctx.usuarioNome,
      usuarioEmail: ctx.usuarioEmail,
    };
    const id = await this.repo.criar(novo);
    // Gancho p/ a etapa 2 (envio de e-mail ao admin do sistema). Hoje é só in-app
    // (tela de Chamados + Sino). Quando houver infra de e-mail, plugar aqui.
    try { await this.notificar(novo); } catch { /* notificação é best-effort */ }
    return id;
  }

  async mudarStatus(id: string, status: string): Promise<void> {
    const st = String(status ?? '').trim() as StatusChamado;
    if (!STATUS_CHAMADO.includes(st)) throw new ErroAplicacao('suporte.status_invalido', 400);
    if (!(await this.repo.buscarPorId(id))) throw new ErroAplicacao('suporte.nao_encontrado', 404);
    await this.repo.definirStatus(id, st, st === 'resolvido' ? new Date() : null);
  }

  // Etapa 2: enviar e-mail ao super-admin com o resumo do chamado.
  // Mantido vazio de propósito — só será preenchido quando a infra de e-mail
  // (provedor + variável de ambiente) for adicionada (o mesmo destrava o "Esqueci a senha").
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async notificar(_chamado: NovoChamado): Promise<void> {
    /* sem envio de e-mail ainda — in-app apenas */
  }
}
