import type { DataSource } from 'typeorm';
import type { Empresa } from '../../domain/empresa/Empresa.js';
import type { EmpresaRepository } from '../../domain/empresa/EmpresaRepository.js';

// Adapter de persistencia. SQL fica AQUI (infra), nunca no dominio/aplicacao.
export class SqlEmpresaRepository implements EmpresaRepository {
  constructor(private readonly ds: DataSource) {}

  async buscarPorCodigo(codigo: string): Promise<Empresa | null> {
    const linhas = await this.ds.query(
      `SELECT id, codigo, nome, fantasia, schema_name, ativo, criado_em
         FROM public.empresa WHERE codigo = $1 LIMIT 1`,
      [codigo],
    );
    const r = linhas[0];
    if (!r) return null;
    return {
      id: r.id,
      codigo: r.codigo,
      nome: r.nome,
      fantasia: r.fantasia,
      schemaName: r.schema_name,
      ativo: r.ativo,
      criadoEm: new Date(r.criado_em),
    };
  }
}
