import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';

interface PrecoProduto { produtoId: string; produtoNome: string; categoriaNome: string | null; unidade: string; ativo: boolean; preco: number; }
const moeda = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function TabelaPreco() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('comercial.preco.gerenciar');
  const [itens, setItens] = useState<PrecoProduto[]>([]);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [salvo, setSalvo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      const lista = await api.get<PrecoProduto[]>('/precos', token!);
      setItens(lista);
      setValores(Object.fromEntries(lista.map((p) => [p.produtoId, String(p.preco)])));
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function salvar(id: string) {
    setErro(null); setSalvo(null);
    try {
      await api.put('/precos/' + id, { preco: Number(valores[id]) }, token!);
      setSalvo(id); setTimeout(() => setSalvo((x) => (x === id ? null : x)), 1500);
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  return (
    <div>
      <h1 className="page-titulo">{t('precos.titulo')}</h1>
      <p className="muted" style={{ marginTop: -8 }}>{t('precos.sub')}</p>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('precos.produto')}</th><th>{t('produtos.categoria')}</th><th>{t('produtos.unidade')}</th><th style={{ width: 220 }}>{t('precos.preco_base')}</th></tr></thead>
        <tbody>
          {itens.length === 0 && <tr><td colSpan={4} className="vazio">{t('precos.sem_produtos')}</td></tr>}
          {itens.map((p) => (
            <tr key={p.produtoId} className={p.ativo ? '' : 'linha-inativa'}>
              <td>{p.produtoNome}</td><td>{p.categoriaNome ?? '—'}</td><td>{p.unidade}</td>
              <td>
                {pode ? (
                  <div className="preco-edit">
                    <input type="number" step="0.01" min="0" value={valores[p.produtoId] ?? ''} onChange={(e) => setValores({ ...valores, [p.produtoId]: e.target.value })} />
                    <button className="btn-ghost btn-mini" onClick={() => salvar(p.produtoId)}>{t('common.salvar')}</button>
                    {salvo === p.produtoId && <span className="salvo-ok">✓</span>}
                  </div>
                ) : moeda(p.preco)}
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
