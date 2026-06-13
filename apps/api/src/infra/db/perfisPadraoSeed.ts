import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import { CAPABILITY_IDS_GERAIS, PERFIS_PADRAO } from '@triade/shared';
import { BcryptHashSenha } from '../security/BcryptHashSenha.js';
import { validarSchema } from '../tenant/validarSchema.js';

// Senha padrão dos usuários de painel TV (sobrescrevível por env). O Gui troca depois.
const SENHA_TV = process.env.SENHA_PAINEL_TV || 'tv123';

// Garante os perfis padrão (Diretor, Comercial, Financeiro, Estoque + 2 Gestão à Vista)
// e os usuários de TV em um tenant. Tudo idempotente — seguro a cada boot/provisionamento.
export async function garantirPerfisPadrao(ds: DataSource, schemaRaw: string, codigo: string): Promise<void> {
  const s = validarSchema(schemaRaw);
  const hash = new BcryptHashSenha();
  for (const p of PERFIS_PADRAO) {
    let perfil = (await ds.query(`SELECT id FROM "${s}".perfil WHERE nome = $1`, [p.nome]))[0];
    if (!perfil) {
      const id = randomUUID();
      await ds.query(`INSERT INTO "${s}".perfil (id, nome, ativo, descricao) VALUES ($1,$2,true,$3)`, [id, p.nome, p.descricao]);
      perfil = { id };
    }
    const caps = p.caps === 'TODAS' ? CAPABILITY_IDS_GERAIS : p.caps;
    for (const cap of caps) {
      await ds.query(`INSERT INTO "${s}".perfil_capability (perfil_id, capability) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [perfil.id, cap]);
    }
    if (p.usuario) {
      const email = `${p.usuario.prefixoEmail}.${codigo}@triade.local`;
      const existe = (await ds.query(`SELECT 1 FROM "${s}".usuario WHERE email = $1`, [email]))[0];
      if (!existe) {
        const senha = await hash.gerar(SENHA_TV);
        await ds.query(
          `INSERT INTO "${s}".usuario (id, nome, email, senha_hash, ativo, perfil_id) VALUES ($1,$2,$3,$4,true,$5)`,
          [randomUUID(), p.nome, email, senha, perfil.id]);
      }
    }
  }
}
