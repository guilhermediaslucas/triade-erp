import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';

interface Chamado {
  id: string; tipo: 'erro' | 'sugestao' | 'duvida'; assunto: string;
  status: 'aberto' | 'em_andamento' | 'resolvido'; criadoEm: string;
}

// Mesma chave usada pelo Sino para saber o que o usuário já viu (zera o badge).
export const CHAVE_CHAMADOS_VISTOS = 'triade_chamados_vistos';
const PILL_TIPO: Record<Chamado['tipo'], string> = { erro: 'pill-erro', sugestao: 'pill-info', duvida: 'pill-neutro' };
const PILL_STATUS: Record<Chamado['status'], string> = { aberto: 'pill-erro', em_andamento: 'pill-aviso', resolvido: 'pill-ok' };

function fmtData(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function MeusChamados() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    api.get<Chamado[]>('/suporte/meus', token!)
      .then((lista) => {
        setChamados(lista);
        // Marca tudo como visto (zera o badge do sino).
        const vistos: Record<string, string> = {};
        for (const c of lista) vistos[c.id] = c.status;
        localStorage.setItem(CHAVE_CHAMADOS_VISTOS, JSON.stringify(vistos));
      })
      .catch((e) => setErro((e as ErroApi).chaveI18n));
    /* eslint-disable-next-line */
  }, []);

  return (
    <div>
      <div className="crumb">{t('meuschamados.crumb')}</div><h1 className="page-titulo">{t('meuschamados.titulo')}</h1>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="card pad0">
        <table className="tabela tabela-cards">
          <thead><tr>
            <th style={{ width: 90 }}>{t('chamados.tipo')}</th>
            <th>{t('chamados.assunto')}</th>
            <th style={{ width: 120 }}>{t('meuschamados.aberto_em')}</th>
            <th style={{ width: 120 }}>{t('chamados.status')}</th>
          </tr></thead>
          <tbody>
            {chamados.length === 0 && <tr><td colSpan={4} className="vazio">{t('meuschamados.vazio')}</td></tr>}
            {chamados.map((c) => (
              <tr key={c.id}>
                <td data-label={t('chamados.tipo')}><span className={'pill ' + PILL_TIPO[c.tipo]}>{t('suporte.tipo_' + c.tipo)}</span></td>
                <td data-label={t('chamados.assunto')}>{c.assunto}</td>
                <td data-label={t('meuschamados.aberto_em')}>{fmtData(c.criadoEm)}</td>
                <td data-label={t('chamados.status')}><span className={'pill ' + PILL_STATUS[c.status]}>{t('chamados.s_' + c.status)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
