import type { AmbienteFiscal } from '../../domain/fiscal/ConfigFiscal.js';
import type {
  ArquivoFiscal, DadosEmissaoNF, EmissorFiscal, RespostaFiscal,
} from '../../domain/fiscal/EmissorFiscal.js';

const BASE: Record<AmbienteFiscal, string> = {
  homologacao: 'https://homologacao.focusnfe.com.br',
  producao: 'https://api.focusnfe.com.br',
};

const soDigitos = (v: string) => (v || '').replace(/\D/g, '');
const round2 = (n: number) => Math.round(n * 100) / 100;

// Adapter da Focus NFe. Traduz os DTOs neutros do domínio para o JSON da Focus
// e normaliza a resposta. Auth = HTTP Basic (token no usuário, senha vazia).
export class FocusNFeEmissor implements EmissorFiscal {
  private auth(token: string): string {
    return 'Basic ' + Buffer.from(token + ':').toString('base64');
  }

  // Monta o corpo da NF-e (versão 4.00) a partir dos dados neutros.
  private montarPayload(d: DadosEmissaoNF): any {
    const e = d.emitente;
    const dest = d.destinatario;
    const corpo: any = {
      natureza_operacao: d.naturezaOperacao,
      data_emissao: new Date().toISOString(),
      tipo_documento: 1,          // saída
      finalidade_emissao: 1,      // normal
      consumidor_final: 1,        // clínica é consumidora final
      presenca_comprador: 9,      // operação não presencial, outros
      modalidade_frete: d.valorFrete > 0 ? 0 : 9,
      // Emitente
      cnpj_emitente: soDigitos(e.cnpj),
      inscricao_estadual_emitente: e.inscricaoEstadual,
      nome_emitente: e.nome,
      logradouro_emitente: e.logradouro,
      numero_emitente: e.numero,
      complemento_emitente: e.complemento || undefined,
      bairro_emitente: e.bairro,
      municipio_emitente: e.municipio,
      uf_emitente: e.uf,
      cep_emitente: soDigitos(e.cep),
      regime_tributario_emitente: e.regime,
      // Destinatário — sempre tratado como NÃO contribuinte (indicador 9, sem IE).
      nome_destinatario: dest.nome,
      indicador_inscricao_estadual_destinatario: 9,
      logradouro_destinatario: dest.logradouro,
      numero_destinatario: dest.numero || 'SN',
      bairro_destinatario: dest.bairro,
      municipio_destinatario: dest.municipio,
      uf_destinatario: dest.uf,
      cep_destinatario: soDigitos(dest.cep),
      // Totais
      valor_frete: round2(d.valorFrete),
      valor_seguro: 0,
      valor_desconto: 0,
      valor_produtos: round2(d.valorProdutos),
      valor_total: round2(d.valorTotal),
      items: d.itens.map((it) => {
        const item: any = {
          numero_item: it.numeroItem,
          codigo_produto: it.codigo,
          descricao: it.descricao,
          cfop: it.cfop,
          unidade_comercial: it.unidade,
          quantidade_comercial: it.quantidade,
          valor_unitario_comercial: round2(it.valorUnitario),
          unidade_tributavel: it.unidade,
          quantidade_tributavel: it.quantidade,
          valor_unitario_tributavel: round2(it.valorUnitario),
          valor_bruto: round2(it.valorBruto),
          inclui_no_total: 1,
          codigo_ncm: it.ncm,
          icms_origem: it.icmsOrigem,
          icms_situacao_tributaria: it.icmsCst, // CSOSN (Simples) ou CST (Normal)
          pis_situacao_tributaria: it.pisCst,
          cofins_situacao_tributaria: it.cofinsCst,
        };
        // CSOSN (Simples) tem 3 dígitos → sem grupo de base. CST de ICMS (Regime Normal) tem 2.
        // CST tributado (00/10/20/70/90) EXIGE o grupo de base (modBC antes de vBC), mesmo com
        // alíquota 0 — senão o XML sai com vBC sem modBC e a SEFAZ rejeita.
        const cst = String(it.icmsCst);
        const cstTributado = ['00', '10', '20', '70', '90'];
        if (cst.length === 2 && cstTributado.includes(cst)) {
          item.icms_modalidade_base_calculo = 3; // 3 = valor da operação
          item.icms_base_calculo = round2(it.valorBruto);
          item.icms_aliquota = it.icmsAliquota;
          item.icms_valor = round2(it.valorBruto * it.icmsAliquota / 100);
        }
        return item;
      }),
    };
    if (dest.pessoaFisica) corpo.cpf_destinatario = soDigitos(dest.documento);
    else corpo.cnpj_destinatario = soDigitos(dest.documento);
    if (dest.telefone) corpo.telefone_destinatario = soDigitos(dest.telefone);
    return corpo;
  }

  private normalizar(body: any): RespostaFiscal {
    // Erro de validação (schema/rejeição) traz "codigo" + "mensagem" (+ "erros").
    if (body && body.codigo && !body.status) {
      const detalhe = Array.isArray(body.erros)
        ? body.erros.map((x: any) => x.mensagem).filter(Boolean).join('; ')
        : '';
      return {
        status: String(body.codigo),
        statusSefaz: null,
        mensagemSefaz: [body.mensagem, detalhe].filter(Boolean).join(' — ') || null,
        chave: null, numero: null, serie: null, caminhoXml: null, caminhoDanfe: null,
      };
    }
    return {
      status: String(body?.status ?? 'desconhecido'),
      statusSefaz: body?.status_sefaz ?? null,
      mensagemSefaz: body?.mensagem_sefaz ?? body?.mensagem ?? null,
      chave: body?.chave_nfe ?? null,
      numero: body?.numero ?? null,
      serie: body?.serie ?? null,
      caminhoXml: body?.caminho_xml_nota_fiscal ?? null,
      caminhoDanfe: body?.caminho_danfe ?? null,
    };
  }

  async emitir(ambiente: AmbienteFiscal, token: string, ref: string, dados: DadosEmissaoNF): Promise<RespostaFiscal> {
    const resp = await fetch(`${BASE[ambiente]}/v2/nfe?ref=${encodeURIComponent(ref)}`, {
      method: 'POST',
      headers: { authorization: this.auth(token), 'content-type': 'application/json' },
      body: JSON.stringify(this.montarPayload(dados)),
    });
    const body = await resp.json().catch(() => ({}));
    return this.normalizar(body);
  }

  async consultar(ambiente: AmbienteFiscal, token: string, ref: string): Promise<RespostaFiscal> {
    const resp = await fetch(`${BASE[ambiente]}/v2/nfe/${encodeURIComponent(ref)}`, {
      headers: { authorization: this.auth(token) },
    });
    const body = await resp.json().catch(() => ({}));
    return this.normalizar(body);
  }

  async cancelar(ambiente: AmbienteFiscal, token: string, ref: string, justificativa: string): Promise<RespostaFiscal> {
    const resp = await fetch(`${BASE[ambiente]}/v2/nfe/${encodeURIComponent(ref)}`, {
      method: 'DELETE',
      headers: { authorization: this.auth(token), 'content-type': 'application/json' },
      body: JSON.stringify({ justificativa }),
    });
    const body = await resp.json().catch(() => ({}));
    return this.normalizar(body);
  }

  async baixarArquivo(ambiente: AmbienteFiscal, token: string, caminhoRelativo: string): Promise<ArquivoFiscal> {
    const url = caminhoRelativo.startsWith('http') ? caminhoRelativo : `${BASE[ambiente]}${caminhoRelativo}`;
    const resp = await fetch(url, { headers: { authorization: this.auth(token) } });
    if (!resp.ok) throw new Error('falha ao baixar arquivo fiscal');
    const buf = Buffer.from(await resp.arrayBuffer());
    const tipo = caminhoRelativo.toLowerCase().endsWith('.xml') ? 'application/xml' : 'application/pdf';
    return { conteudo: buf, tipo };
  }
}
