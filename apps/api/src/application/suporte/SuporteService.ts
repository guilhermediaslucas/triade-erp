import type { Chamado, ChamadoRepository, NovoChamado, StatusChamado, TipoChamado } from '../../domain/superadmin/Chamado.js';
import { STATUS_CHAMADO, TIPOS_CHAMADO } from '../../domain/superadmin/Chamado.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';
import type { EmailSender } from '../../domain/ports/EmailSender.js';

const ROTULO_TIPO: Record<TipoChamado, string> = { erro: 'Erro', sugestao: 'Sugestão', duvida: 'Dúvida' };
function escaparHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

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
  constructor(
    private readonly repo: ChamadoRepository,
    private readonly email?: EmailSender,
    private readonly destino?: string,
  ) {}

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

  // Notifica o administrador do sistema por e-mail (Resend). Best-effort: se não
  // houver EmailSender/destino configurado, simplesmente não envia.
  private async notificar(c: NovoChamado): Promise<void> {
    if (!this.email || !this.destino) return;
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1f2430;">
        <h2 style="margin:0 0 12px;">Novo chamado de suporte — ${ROTULO_TIPO[c.tipo]}</h2>
        <p style="font-size:16px;font-weight:600;margin:0 0 12px;">${escaparHtml(c.assunto)}</p>
        <p style="white-space:pre-wrap;background:#f4f5fa;border:1px solid #ececf2;border-radius:8px;padding:12px;">${escaparHtml(c.descricao)}</p>
        <table style="font-size:13px;color:#555;margin-top:12px;">
          <tr><td style="padding:2px 10px 2px 0;">Empresa</td><td>${escaparHtml(c.empresaCodigo)}</td></tr>
          <tr><td style="padding:2px 10px 2px 0;">Usuário</td><td>${escaparHtml(c.usuarioNome)} &lt;${escaparHtml(c.usuarioEmail)}&gt;</td></tr>
          <tr><td style="padding:2px 10px 2px 0;">Tela / versão</td><td>${escaparHtml(c.tela || '—')} · v${escaparHtml(c.versao || '—')}</td></tr>
        </table>
        ${c.print ? '<p style="font-size:12px;color:#888;margin-top:12px;">(O chamado tem um print anexado — veja na tela de Chamados de suporte.)</p>' : ''}
        <p style="font-size:12px;color:#888;margin-top:16px;">Abra o sistema em Super-admin › Chamados de suporte para responder/mudar o status.</p>
      </div>`;
    const texto = `Novo chamado (${ROTULO_TIPO[c.tipo]}): ${c.assunto}\n\n${c.descricao}\n\n`
      + `Empresa: ${c.empresaCodigo}\nUsuário: ${c.usuarioNome} <${c.usuarioEmail}>\nTela: ${c.tela || '—'} · v${c.versao || '—'}`;
    await this.email.enviar({
      para: this.destino,
      assunto: `[Suporte TRIADE] ${ROTULO_TIPO[c.tipo]}: ${c.assunto}`,
      html,
      texto,
    });
  }
}
