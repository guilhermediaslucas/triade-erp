import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Ic } from './Icones.js';

type Tipo = 'ok' | 'erro';
interface Item { id: number; msg: string; tipo: Tipo; }
// Toast de ação persistente (canto inferior direito) — só fecha no Fechar/Abrir.
interface Acao { id: number; titulo: string; corpo: string; href: string; }

const Ctx = createContext<(msg: string, tipo?: Tipo) => void>(() => {});
export function useToast(): (msg: string, tipo?: Tipo) => void { return useContext(Ctx); }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<Item[]>([]);
  const [acoes, setAcoes] = useState<Acao[]>([]);
  const toast = useCallback((msg: string, tipo: Tipo = 'ok') => {
    if (!msg) return;
    const id = Date.now() + Math.random();
    setItens((l) => [...l, { id, msg, tipo }]);
    setTimeout(() => setItens((l) => l.filter((x) => x.id !== id)), 3500);
  }, []);

  useEffect(() => {
    const h = (e: Event) => { const d = (e as CustomEvent).detail; if (d?.msg) toast(d.msg, d.tipo ?? 'ok'); };
    // Toast de ação persistente: window.dispatchEvent(new CustomEvent('toast-acao', {detail:{titulo,corpo,href}}))
    const ha = (e: Event) => {
      const d = (e as CustomEvent).detail; if (!d?.titulo) return;
      setAcoes((l) => [...l, { id: Date.now() + Math.random(), titulo: d.titulo, corpo: d.corpo ?? '', href: d.href ?? '' }]);
    };
    window.addEventListener('toast', h);
    window.addEventListener('toast-acao', ha);
    return () => { window.removeEventListener('toast', h); window.removeEventListener('toast-acao', ha); };
  }, [toast]);

  const fechar = (id: number) => setAcoes((l) => l.filter((x) => x.id !== id));

  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="toast-wrap">
        {acoes.map((a) => (
          <div key={a.id} className="toast-acao">
            <div className="toast-acao-h"><span className="toast-acao-ic"><Ic name="i-clock" className="sm" /></span>{a.titulo}<button className="toast-acao-x" onClick={() => fechar(a.id)} aria-label="Fechar">×</button></div>
            <div className="toast-acao-b" dangerouslySetInnerHTML={{ __html: a.corpo }} />
            <div className="toast-acao-f">
              <button className="btn-ghost btn-mini" onClick={() => fechar(a.id)}>Fechar</button>
              <button className="btn-primary btn-mini" onClick={() => { if (a.href) window.location.assign(a.href); }}>Abrir</button>
            </div>
          </div>
        ))}
        {itens.map((it) => (
          <div key={it.id} className={'toast-item ' + it.tipo}>
            <span className="toast-ic"><Ic name={it.tipo === 'ok' ? 'i-check' : 'i-alert'} className="sm" /></span>{it.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
