import type { AmbienteFiscal } from '../../domain/fiscal/ConfigFiscal.js';
import type { ItemNfeRecebida, NfeRecebida, ReceptorFiscal } from '../../domain/fiscal/ReceptorFiscal.js';

const BASE: Record<AmbienteFiscal, string> = {
  homologacao: 'https://homologacao.focusnfe.com.br',
  producao: 'https://api.focusnfe.com.br',
};

// Adapter Focus para NF-e RECEBIDAS (Manifestação do Destinatário / distribuição DF-e).
// Auth = HTTP Basic (token no usuário, senha vazia), igual ao emissor.
// OBS: os nomes de campo do JSON do Focus podem variar; a leitura é defensiva (pick de várias
// chaves) e deve ser afinada contra respostas reais — como foi feito com o emissor.
export class FocusNFeReceptor implements ReceptorFiscal {
  configurado(): boolean { return true; } // o gate real é o token da empresa (checado no serviço)

  private auth(token: string): string {
    return 'Basic ' + Buffer.from(token + ':').toString('base64');
  }

  async listar(ambiente: AmbienteFiscal, token: string): Promise<NfeRecebida[]> {
    const resp = await fetch(`${BASE[ambiente]}/v2/nfes_recebidas`, { headers: { authorization: this.auth(token) } });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      throw new Error(`Focus nfes_recebidas ${resp.status}: ${txt.slice(0, 300)}`);
    }
    const dados = await resp.json().catch(() => null);
    const lista: any[] = Array.isArray(dados) ? dados : (dados?.notas ?? dados?.nfes ?? []);
    const out: NfeRecebida[] = [];
    for (const n of lista) {
      const chave = pick(n, ['chave_nfe', 'chave', 'chave_acesso']);
      if (!chave) continue;
      // Ciência automática (libera o XML completo). Best-effort: se já manifestada, o Focus ignora/erra e seguimos.
      await this.ciencia(ambiente, token, chave).catch(() => {});
      let itens: ItemNfeRecebida[] = [];
      let emitenteCnpj = pick(n, ['cnpj_emitente', 'emitente_cnpj', 'cnpj']);
      let emitenteNome = pick(n, ['nome_emitente', 'emitente_nome', 'razao_social_emitente']);
      let valor = num(pick(n, ['valor_liquido', 'valor_total', 'valor', 'valor_total_nota']));
      // XML completo (após ciência) → extrai itens/emitente/total.
      const caminhoXml = pick(n, ['caminho_xml_nota_fiscal', 'caminho_xml', 'xml']);
      const xml = caminhoXml ? await this.baixarTexto(ambiente, token, caminhoXml).catch(() => null) : null;
      if (xml) {
        const p = parseNfeXml(xml);
        itens = p.itens;
        emitenteCnpj = emitenteCnpj ?? p.emitenteCnpj;
        emitenteNome = emitenteNome ?? p.emitenteNome;
        if (!valor && p.valor) valor = p.valor;
      }
      out.push({
        chave,
        emitenteCnpj: emitenteCnpj ?? null,
        emitenteNome: emitenteNome ?? null,
        numero: pick(n, ['numero', 'numero_nfe', 'nnf']) ?? null,
        serie: pick(n, ['serie']) ?? null,
        emissao: isoData(pick(n, ['data_emissao', 'dhEmi', 'emissao'])),
        valor,
        itens,
      });
    }
    return out;
  }

  private async ciencia(ambiente: AmbienteFiscal, token: string, chave: string): Promise<void> {
    await fetch(`${BASE[ambiente]}/v2/nfes_recebidas/${encodeURIComponent(chave)}/manifesto`, {
      method: 'POST',
      headers: { authorization: this.auth(token), 'content-type': 'application/json' },
      body: JSON.stringify({ tipo: 'ciencia' }),
    });
  }

  private async baixarTexto(ambiente: AmbienteFiscal, token: string, caminho: string): Promise<string> {
    const url = caminho.startsWith('http') ? caminho : `${BASE[ambiente]}${caminho}`;
    const resp = await fetch(url, { headers: { authorization: this.auth(token) } });
    if (!resp.ok) throw new Error('xml ' + resp.status);
    return resp.text();
  }
}

function pick(o: any, chaves: string[]): string | null {
  for (const k of chaves) { const v = o?.[k]; if (v != null && String(v).trim() !== '') return String(v); }
  return null;
}
function num(v: any): number { const n = Number(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : 0; }
function isoData(v: string | null): string | null {
  if (!v) return null;
  const m = String(v).match(/\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : null;
}

// Parse leve de NF-e (XML padrão SEFAZ) por regex. Extrai emitente, total e itens (<det>).
function parseNfeXml(xml: string): { emitenteCnpj: string | null; emitenteNome: string | null; valor: number; itens: ItemNfeRecebida[] } {
  const emit = /<emit>([\s\S]*?)<\/emit>/.exec(xml)?.[1] ?? '';
  const emitenteCnpj = /<CNPJ>(\d+)<\/CNPJ>/.exec(emit)?.[1] ?? null;
  const emitenteNome = tag(emit, 'xNome');
  const valor = num(tag(xml, 'vNF'));
  const itens: ItemNfeRecebida[] = [];
  const dets = xml.match(/<det[\s>][\s\S]*?<\/det>/g) ?? [];
  for (const det of dets) {
    const prod = /<prod>([\s\S]*?)<\/prod>/.exec(det)?.[1] ?? det;
    itens.push({
      codigo: tag(prod, 'cProd') ?? '',
      descricao: tag(prod, 'xProd') ?? '',
      ncm: tag(prod, 'NCM'),
      quantidade: num(tag(prod, 'qCom')),
      valorUnitario: num(tag(prod, 'vUnCom')),
      valorTotal: num(tag(prod, 'vProd')),
    });
  }
  return { emitenteCnpj, emitenteNome, valor, itens };
}
function tag(xml: string, nome: string): string | null {
  const m = new RegExp(`<${nome}>([\\s\\S]*?)</${nome}>`).exec(xml);
  return m ? m[1]!.trim() : null;
}
