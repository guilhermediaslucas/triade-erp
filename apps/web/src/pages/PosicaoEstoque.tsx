import { Fragment, useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';

interface Lote { id: string; lote: string | null; validade: string | null; quantidade: number; custoUnitario: number; }
interface Posicao { produtoId: string; produtoNome: string; unidade: string; estoqueMinimo: number; saldo: number; abaixoMinimo: boolean; lotes: Lote[]; }

export function PosicaoEstoque() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [itens, setItens] = useState<Posicao[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [aberto, setAberto] = useState<Record<string, boolean>>({});

  useEffect(() => { api.get<Posicao[]>('/estoque', token!).then(setItens).catch((e) => setErro((e as ErroApi).chaveI18n)); /* eslint-disable-next-line */ }, []);
  const fmtData = (d: string | null) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—';

  return (
    <div>
      <h1 className="page-titulo">{t('estoque.titulo')}</h1>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="card pad0"><table className="tabela">
        <thead><tr><th></th><th>{t('precos.produto')}</th><th>{t('produtos.unidade')}</th><th>{t('estoque.saldo')}</th><th>{t('produtos.minimo')}</th><th>{t('usuarios.situacao')}</th></tr></thead>
        <tbody>
          {itens.length === 0 && <tr><td colSpan={6} className="vazio">{t('precos.sem_produtos')}</td></tr>}
          {itens.map((p) => (
            <Fragment key={p.produtoId}>
              <tr className="linha-click" onClick={() => setAberto({ ...aberto, [p.produtoId]: !aberto[p.produtoId] })}>
                <td style={{ width: 28 }}>{p.lotes.length > 0 ? (aberto[p.produtoId] ? '▾' : '▸') : ''}</td>
                <td>{p.produtoNome}</td><td>{p.unidade}</td><td><b>{p.saldo}</b></td><td>{p.estoqueMinimo}</td>
                <td>{p.abaixoMinimo ? <span className="pill st-laranja">{t('estoque.baixo')}</span> : <span className="pill st-verde">{t('estoque.ok')}</span>}</td>
              </tr>
              {aberto[p.produtoId] && p.lotes.map((l) => (
                <tr key={l.id} className="lote-row">
                  <td></td>
                  <td colSpan={2} style={{ paddingLeft: 24 }}>{t('estoque.lote')}: <b>{l.lote ?? '—'}</b></td>
                  <td>{l.quantidade}</td>
                  <td colSpan={2}>{t('estoque.validade')}: {fmtData(l.validade)}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
