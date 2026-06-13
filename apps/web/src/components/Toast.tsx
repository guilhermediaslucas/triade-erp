import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Ic } from './Icones.js';

type Tipo = 'ok' | 'erro';
interface Item { id: number; msg: string; tipo: Tipo; }

const Ctx = createContext<(msg: string, tipo?: Tipo) => void>(() => {});
export function useToast(): (msg: string, tipo?: Tipo) => void { return useContext(Ctx); }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<Item[]>([]);
  const toast = useCallback((msg: string, tipo: Tipo = 'ok') => {
    if (!msg) return;
    const id = Date.now() + Math.random();
    setItens((l) => [...l, { id, msg, tipo }]);
    setTimeout(() => setItens((l) => l.filter((x) => x.id !== id)), 3500);
  }, []);

  // Permite disparar toast de qualquer lugar sem o hook: window.dispatchEvent(new CustomEvent('toast', {detail:{msg,tipo}})).
  useEffect(() => {
    const h = (e: Event) => { const d = (e as CustomEvent).detail; if (d?.msg) toast(d.msg, d.tipo ?? 'ok'); };
    window.addEventListener('toast', h);
    return () => window.removeEventListener('toast', h);
  }, [toast]);

  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="toast-wrap">
        {itens.map((it) => (
          <div key={it.id} className={'toast-item ' + it.tipo}>
            <span className="toast-ic"><Ic name={it.tipo === 'ok' ? 'i-check' : 'i-alert'} className="sm" /></span>{it.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
