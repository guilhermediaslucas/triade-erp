import { useRef } from 'react';

// Auto-bip: registra o código sem precisar de Enter. Após uma pausa curta na
// digitação/leitura, dispara o bip automaticamente (agiliza leitores USB que
// não enviam Enter). Se o Enter chegar antes, cancela o timer e bipa na hora.
export function useAutoBip(bipar: (v: string) => void, delay = 180) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelar = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };

  // Use no onChange do campo: atualiza o valor e agenda o bip.
  const aoDigitar = (v: string, setScan: (s: string) => void) => {
    setScan(v);
    cancelar();
    if (v.trim()) timer.current = setTimeout(() => { timer.current = null; bipar(v.trim()); }, delay);
  };
  // Use no Enter: cancela o agendamento e bipa imediatamente.
  const aoEnter = (v: string) => { cancelar(); if (v.trim()) bipar(v.trim()); };

  return { aoDigitar, aoEnter, cancelar };
}
