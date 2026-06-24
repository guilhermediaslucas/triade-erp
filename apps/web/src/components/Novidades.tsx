import { Ic } from './Icones.js';

// Resumo curto do que mudou por versão. Atualizar a cada release (a versão exibida
// vem de apps/web/package.json via __APP_VERSION__).
const NOVIDADES: { versao: string; itens: string[] }[] = [
  {
    versao: '0.1.0',
    itens: [
      'Aviso de nova versão: no site, botão "Recarregar agora"; no app, "Baixar nova versão".',
      'Rodapé do menu mostra a versão atual — clique para ver estas novidades.',
    ],
  },
];

export function Novidades({ onFechar }: { onFechar: () => void }) {
  const atual = NOVIDADES.find((n) => n.versao === __APP_VERSION__) ?? NOVIDADES[0];
  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
      <h2><Ic name="i-help" /> Novidades · v{__APP_VERSION__}</h2>
      {atual ? (
        <ul className="nov-list">
          {atual.itens.map((it, i) => <li key={i}>{it}</li>)}
        </ul>
      ) : (
        <p style={{ margin: 0, color: 'var(--muted)' }}>Sem novidades registradas para esta versão.</p>
      )}
      <div className="modal-acoes">
        <button className="btn-primary" onClick={onFechar}>Entendi</button>
      </div>
    </div></div>
  );
}
