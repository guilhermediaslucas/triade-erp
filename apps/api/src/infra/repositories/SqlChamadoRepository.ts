import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { Chamado, ChamadoRepository, NovoChamado, StatusChamado } from '../../domain/superadmin/Chamado.js';

function mapear(r: any): Chamado {
  return {
    id: r.id,
    tipo: r.tipo,
    assunto: r.assunto,
    descricao: r.descricao,
    print: r.print ?? null,
    tela: r.tela ?? '',
    versao: r.versao ?? '',
    empresaCodigo: r.empresa_codigo ?? '',
    empresaFantasia: r.empresa_fantasia ?? r.empresa_codigo ?? '',
    usuarioNome: r.usuario_nome ?? '',
    usuarioEmail: r.usuario_email ?? '',
    status: r.status,
    criadoEm: new Date(r.criado_em),
    resolvidoEm: r.resolvido_em ? new Date(r.resolvido_em) : null,
  };
}

const SELECT = `SELECT c.*, e.fantasia AS empresa_fantasia
                FROM public.chamado_suporte c
                LEFT JOIN public.empresa e ON e.codigo = c.empresa_codigo`;

export class SqlChamadoRepository implements ChamadoRepository {
  constructor(private readonly ds: DataSource) {}

  async listar(): Promise<Chamado[]> {
    const linhas = await this.ds.query(`${SELECT} ORDER BY c.criado_em DESC`);
    return linhas.map(mapear);
  }

  async buscarPorId(id: string): Promise<Chamado | null> {
    const r = (await this.ds.query(`${SELECT} WHERE c.id = $1 LIMIT 1`, [id]))[0];
    return r ? mapear(r) : null;
  }

  async contarAbertos(): Promise<number> {
    const r = (await this.ds.query(`SELECT COUNT(*)::int AS n FROM public.chamado_suporte WHERE status = 'aberto'`))[0];
    return Number(r?.n ?? 0);
  }

  async criar(c: NovoChamado): Promise<string> {
    const id = randomUUID();
    await this.ds.query(
      `INSERT INTO public.chamado_suporte
        (id, tipo, assunto, descricao, print, tela, versao, empresa_codigo, usuario_nome, usuario_email)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [id, c.tipo, c.assunto, c.descricao, c.print, c.tela, c.versao, c.empresaCodigo, c.usuarioNome, c.usuarioEmail],
    );
    return id;
  }

  async definirStatus(id: string, status: StatusChamado, resolvidoEm: Date | null): Promise<void> {
    await this.ds.query(
      `UPDATE public.chamado_suporte SET status = $2, resolvido_em = $3 WHERE id = $1`,
      [id, status, resolvidoEm],
    );
  }
}
