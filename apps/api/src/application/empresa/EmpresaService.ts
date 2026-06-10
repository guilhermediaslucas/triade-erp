import { IDIOMAS } from '@triade/shared';
import type { Empresa } from '../../domain/empresa/Empresa.js';
import type { AtualizacaoEmpresa, EmpresaRepository } from '../../domain/empresa/EmpresaRepository.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

const HEX = /^#[0-9a-fA-F]{6}$/;

export class EmpresaService {
  constructor(private readonly empresas: EmpresaRepository) {}

  async obter(codigo: string): Promise<Empresa> {
    const e = await this.empresas.buscarPorCodigo(codigo);
    if (!e) throw new ErroAplicacao('empresa.nao_encontrada', 404);
    return e;
  }

  async atualizar(codigo: string, d: AtualizacaoEmpresa): Promise<void> {
    if (!d.fantasia || d.fantasia.trim().length < 2) throw new ErroAplicacao('empresa.fantasia_invalida', 400);
    for (const cor of [d.corPrimaria, d.corMenuFundo, d.corMenuFonte]) {
      if (!HEX.test(cor)) throw new ErroAplicacao('empresa.cor_invalida', 400);
    }
    if (!IDIOMAS.includes(d.idiomaPadrao as any)) throw new ErroAplicacao('empresa.idioma_invalido', 400);
    if (!d.timezonePadrao || d.timezonePadrao.trim() === '') throw new ErroAplicacao('empresa.timezone_invalido', 400);
    await this.empresas.atualizar(codigo, {
      fantasia: d.fantasia.trim(),
      logo: d.logo && d.logo.trim() !== '' ? d.logo : null,
      corPrimaria: d.corPrimaria, corMenuFundo: d.corMenuFundo, corMenuFonte: d.corMenuFonte,
      idiomaPadrao: d.idiomaPadrao, timezonePadrao: d.timezonePadrao.trim(),
    });
  }
}
