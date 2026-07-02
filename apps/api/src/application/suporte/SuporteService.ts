import type { Chamado, ChamadoRepository, NovoChamado, StatusChamado, TipoChamado } from '../../domain/superadmin/Chamado.js';
import { STATUS_CHAMADO, TIPOS_CHAMADO } from '../../domain/superadmin/Chamado.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';
import type { AnexoEmail, EmailSender } from '../../domain/ports/EmailSender.js';
import type { LlmProvider } from '../../domain/ia/LlmProvider.js';

const ROTULO_TIPO: Record<TipoChamado, string> = { erro: 'Erro', sugestao: 'Sugestão', duvida: 'Dúvida' };

// Resultado da análise de um chamado pela IA.
export interface AnaliseChamado {
  modulo: string;
  urgencia: 'alta' | 'media' | 'baixa';
  tipo: TipoChamado;
  causa: string;
  resposta: string;
  status: StatusChamado;
}
function extrairJson(txt: string): any {
  const m = txt.match(/[[{][\s\S]*[\]}]/);
  try { return JSON.parse(m ? m[0] : txt); } catch { return null; }
}
function escaparHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
// Converte o print (data URI) em anexo de e-mail. Retorna null se não for uma imagem base64 válida.
function printComoAnexo(print: string | null): AnexoEmail | null {
  if (!print) return null;
  const m = print.match(/^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!m) return null;
  const ext = (m[1] || 'png').toLowerCase().replace('jpeg', 'jpg');
  return { nomeArquivo: `print-chamado.${ext}`, conteudoBase64: m[2]! };
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
    private readonly llm?: LlmProvider,
    private readonly modelo?: string,           // base (Haiku) — triagem/dúvida/sugestão
    private readonly modeloAvancado?: string,   // avançado (Sonnet) — chamados de ERRO (mais técnicos)
  ) {}

  listar(): Promise<Chamado[]> { return this.repo.listar(); }
  meus(email: string, empresaCodigo: string): Promise<Chamado[]> { return this.repo.listarPorUsuario(email, empresaCodigo); }
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
    const chamado = await this.repo.buscarPorId(id);
    if (!chamado) throw new ErroAplicacao('suporte.nao_encontrado', 404);
    await this.repo.definirStatus(id, st, st === 'resolvido' ? new Date() : null);
    // Avisa o autor por e-mail nas movimentações relevantes (best-effort).
    try { await this.notificarUsuario(chamado, st); } catch { /* notificação é best-effort */ }
  }

  // Analisa um chamado com a IA: triagem (módulo/urgência/tipo), causa provável,
  // resposta sugerida e status sugerido. Retorna JSON estruturado.
  async analisar(id: string): Promise<AnaliseChamado> {
    if (!this.llm || !this.modelo) throw new ErroAplicacao('ia.nao_configurada', 400);
    const c = await this.repo.buscarPorId(id);
    if (!c) throw new ErroAplicacao('suporte.nao_encontrado', 404);
    const system = 'Você é o suporte técnico do ERP Tríade (gestão para distribuidoras de produtos estéticos B2B). '
      + 'Analise o chamado e responda SOMENTE com um JSON válido, sem texto fora do JSON, no formato: '
      + '{"modulo": "Comercial|Financeiro|Estoque|Logística|Cadastros|Configurações|Relatórios|Outro", '
      + '"urgencia": "alta|media|baixa", "tipo": "erro|sugestao|duvida", "causa": "causa provável, curta", '
      + '"resposta": "resposta cordial e objetiva ao usuário, em pt-BR, pronta para enviar", '
      + '"status": "em_andamento|resolvido"}. Dúvida simples pode ser "resolvido"; erro/sugestão a investigar, "em_andamento".';
    const conteudo = `Tipo informado: ${c.tipo}\nAssunto: ${c.assunto}\nDescrição: ${c.descricao}\n`
      + `Tela: ${c.tela || '—'}\nVersão: ${c.versao || '—'}\nEmpresa: ${c.empresaCodigo}\nUsuário: ${c.usuarioNome}`;
    // Erros (mais técnicos) usam o modelo avançado (Sonnet) quando disponível; o resto usa o base (Haiku).
    const modelo = (c.tipo === 'erro' && this.modeloAvancado) ? this.modeloAvancado : this.modelo;
    const r = await this.llm.chamar(modelo, system, [{ role: 'user', content: conteudo }], []);
    const j = extrairJson(r.texto) ?? {};
    const urg = ['alta', 'media', 'baixa'].includes(j.urgencia) ? j.urgencia : 'media';
    const tp = TIPOS_CHAMADO.includes(j.tipo) ? j.tipo : c.tipo;
    const st = j.status === 'resolvido' ? 'resolvido' : 'em_andamento';
    return {
      modulo: String(j.modulo ?? 'Outro'), urgencia: urg, tipo: tp,
      causa: String(j.causa ?? ''), resposta: String(j.resposta ?? ''), status: st,
    };
  }

  // Triagem em lote (módulo + urgência) de todos os chamados abertos, numa única chamada à IA.
  async analisarPendentes(): Promise<{ id: string; modulo: string; urgencia: string }[]> {
    if (!this.llm || !this.modelo) throw new ErroAplicacao('ia.nao_configurada', 400);
    const abertos = (await this.repo.listar()).filter((c) => c.status === 'aberto');
    if (abertos.length === 0) return [];
    const lista = abertos.map((c, i) => `${i + 1}. [${c.tipo}] ${c.assunto} — ${c.descricao.slice(0, 200)}`).join('\n');
    const system = 'Classifique cada chamado do ERP Tríade. Responda SOMENTE um JSON array, sem texto fora do JSON: '
      + '[{"n": número do item, "modulo": string, "urgencia": "alta|media|baixa"}].';
    const r = await this.llm.chamar(this.modelo, system, [{ role: 'user', content: lista }], []);
    const arr = extrairJson(r.texto);
    if (!Array.isArray(arr)) return [];
    return arr.map((x: any) => ({ id: abertos[Number(x?.n) - 1]?.id ?? '', modulo: String(x?.modulo ?? ''), urgencia: String(x?.urgencia ?? '') }))
      .filter((x) => x.id);
  }

  // "Aplicar": muda o status e envia a resposta (editada pelo super-admin) ao autor por e-mail.
  async responder(id: string, status: string, resposta: string): Promise<void> {
    const st = String(status ?? '').trim() as StatusChamado;
    if (!STATUS_CHAMADO.includes(st)) throw new ErroAplicacao('suporte.status_invalido', 400);
    const c = await this.repo.buscarPorId(id);
    if (!c) throw new ErroAplicacao('suporte.nao_encontrado', 404);
    await this.repo.definirStatus(id, st, st === 'resolvido' ? new Date() : null);
    const txt = String(resposta ?? '').trim();
    if (txt && this.email && c.usuarioEmail) {
      const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1f2430;">`
        + `<p style="margin:0 0 8px;">Sobre o seu chamado <b>"${escaparHtml(c.assunto)}"</b>:</p>`
        + `<p style="white-space:pre-wrap;background:#f4f5fa;border:1px solid #ececf2;border-radius:8px;padding:12px;">${escaparHtml(txt)}</p></div>`;
      try { await this.email.enviar({ para: c.usuarioEmail, assunto: `[Suporte TRIADE] Sobre: ${c.assunto}`, html, texto: txt }); } catch { /* best-effort */ }
    }
  }

  // E-mail ao autor do chamado quando vira "em andamento" ou "resolvido".
  private async notificarUsuario(c: Chamado, status: StatusChamado): Promise<void> {
    if (!this.email || !c.usuarioEmail) return;
    if (status !== 'em_andamento' && status !== 'resolvido') return;
    const emAndamento = status === 'em_andamento';
    const titulo = emAndamento ? 'Seu chamado está em andamento' : 'Seu chamado foi resolvido';
    const frase = emAndamento
      ? 'O suporte começou a analisar seu chamado.'
      : 'O suporte marcou seu chamado como resolvido.';
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1f2430;">
        <h2 style="margin:0 0 12px;">${titulo}</h2>
        <p style="margin:0 0 8px;">Seu chamado <b>"${escaparHtml(c.assunto)}"</b> — ${frase}</p>
        <p style="font-size:12px;color:#888;margin-top:16px;">Você pode acompanhar seus chamados no sistema, em "Meus chamados".</p>
      </div>`;
    const texto = `${titulo}\n\nSeu chamado "${c.assunto}" — ${frase}`;
    await this.email.enviar({ para: c.usuarioEmail, assunto: `[Suporte TRIADE] ${titulo}`, html, texto });
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
        ${c.print ? '<p style="font-size:12px;color:#888;margin-top:12px;">(Print da tela anexado a este e-mail.)</p>' : ''}
        <p style="font-size:12px;color:#888;margin-top:16px;">Abra o sistema em Super-admin › Chamados de suporte para responder/mudar o status.</p>
      </div>`;
    const texto = `Novo chamado (${ROTULO_TIPO[c.tipo]}): ${c.assunto}\n\n${c.descricao}\n\n`
      + `Empresa: ${c.empresaCodigo}\nUsuário: ${c.usuarioNome} <${c.usuarioEmail}>\nTela: ${c.tela || '—'} · v${c.versao || '—'}`;
    const anexo = printComoAnexo(c.print);
    await this.email.enviar({
      para: this.destino,
      assunto: `[Suporte TRIADE] ${ROTULO_TIPO[c.tipo]}: ${c.assunto}`,
      html,
      texto,
      ...(anexo ? { anexos: [anexo] } : {}),
    });
  }
}
