import { createHash, randomBytes } from 'node:crypto';
import type { EmpresaRepository } from '../../domain/empresa/EmpresaRepository.js';
import type { UsuarioRepository } from '../../domain/usuario/UsuarioRepository.js';
import type { SuperAdminRepository } from '../../domain/superadmin/SuperAdmin.js';
import type { ResetSenhaRepository } from '../../domain/auth/ResetSenha.js';
import type { HashSenha } from '../../domain/ports/HashSenha.js';
import type { EmailSender } from '../../domain/ports/EmailSender.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

const VALIDADE_MS = 60 * 60 * 1000;   // 1 hora
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

// Caso de uso: recuperação de senha por e-mail (super-admin ou usuário de tenant).
// Token aleatório enviado por e-mail; no banco guardamos só o HASH, com validade
// e uso único. "solicitar" NUNCA revela se o e-mail existe (boa prática).
export class RecuperarSenha {
  constructor(
    private readonly empresas: EmpresaRepository,
    private readonly usuarios: UsuarioRepository,
    private readonly superAdmins: SuperAdminRepository,
    private readonly resets: ResetSenhaRepository,
    private readonly hash: HashSenha,
    private readonly email: EmailSender,
    private readonly appUrl: string,
  ) {}

  async solicitar(emailEntrada: string): Promise<void> {
    const email = String(emailEntrada ?? '').trim().toLowerCase();
    if (!email) return;   // resposta neutra mesmo sem e-mail

    // Descobre o alvo: super-admin primeiro; senão usuário ativo em algum tenant.
    let schemaName: string | null = null;
    let usuarioId: string | null = null;
    let achou = false;

    const sa = await this.superAdmins.buscarPorEmail(email);
    if (sa) { achou = true; }
    else {
      for (const e of await this.empresas.listarTodas()) {
        if (!e.ativo) continue;
        const u = await this.usuarios.buscarPorEmail(e.schemaName, email);
        if (u && u.ativo) { schemaName = e.schemaName; usuarioId = u.id; achou = true; break; }
      }
    }

    // Não revela se o e-mail existe: se não achou, simplesmente não envia.
    if (!achou) return;

    const token = randomBytes(32).toString('hex');
    await this.resets.criar({
      tokenHash: sha256(token),
      email,
      schemaName,
      usuarioId,
      expiraEm: new Date(Date.now() + VALIDADE_MS),
    });

    const link = `${this.appUrl}/redefinir-senha?token=${token}`;
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1f2430;">
        <h2 style="margin:0 0 12px;">Redefinição de senha — TRIADE ERP</h2>
        <p>Recebemos um pedido para redefinir a senha desta conta. Clique no botão abaixo (válido por 1 hora):</p>
        <p style="margin:18px 0;">
          <a href="${link}" style="background:#e1483b;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:600;">Definir nova senha</a>
        </p>
        <p style="font-size:12px;color:#888;">Se o botão não funcionar, copie e cole este link no navegador:<br>${link}</p>
        <p style="font-size:12px;color:#888;margin-top:16px;">Se você não pediu isso, ignore este e-mail — sua senha continua a mesma.</p>
      </div>`;
    const texto = `Redefinição de senha — TRIADE ERP\n\nAbra este link (válido por 1 hora) para definir uma nova senha:\n${link}\n\nSe você não pediu isso, ignore este e-mail.`;
    await this.email.enviar({ para: email, assunto: 'Redefinição de senha — TRIADE ERP', html, texto });
  }

  async redefinir(token: string, novaSenha: string): Promise<void> {
    const tk = String(token ?? '').trim();
    if (!tk) throw new ErroAplicacao('auth.reset_invalido', 400);
    if (String(novaSenha ?? '').length < 6) throw new ErroAplicacao('usuario.senha_curta', 400);

    const reg = await this.resets.buscarPorTokenHash(sha256(tk));
    if (!reg || reg.usadoEm || reg.expiraEm.getTime() < Date.now()) {
      throw new ErroAplicacao('auth.reset_invalido', 400);
    }

    const senhaHash = await this.hash.gerar(novaSenha);
    if (reg.schemaName && reg.usuarioId) {
      await this.usuarios.definirSenha(reg.schemaName, reg.usuarioId, senhaHash);
    } else {
      await this.superAdmins.atualizarSenha(reg.email, senhaHash);
    }
    await this.resets.marcarUsado(reg.id);
  }
}
